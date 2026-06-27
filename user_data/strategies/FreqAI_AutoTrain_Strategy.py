from freqtrade.strategy import IStrategy, merge_informative_pair
from freqtrade.freqai.prediction_models.LightGBMClassifier import LightGBMClassifier
from pandas import DataFrame
import talib.abstract as ta
import numpy as np
from datetime import datetime
from functools import reduce


class FreqAI_AutoTrain_Strategy(IStrategy):
    """
    FreqAI Strategy that trains itself automatically
    Uses LightGBM Classifier with optimized features
    Retrains every 4 hours on new data
    """
    
    INTERFACE_VERSION = 3
    timeframe = '5m'
    can_short = False
    
    minimal_roi = {
        "60": 0.01,
        "30": 0.02,
        "0": 0.03
    }
    
    stoploss = -0.08
    trailing_stop = True
    trailing_stop_positive = 0.01
    trailing_stop_positive_offset = 0.02
    trailing_only_offset_is_reached = True
    
    process_only_new_candles = True
    use_exit_signal = True
    exit_profit_only = False
    ignore_roi_if_entry_signal = False
    startup_candle_count = 200
    
    # FreqAI configuration - KEY SETTINGS FOR AUTO-TRAINING
    freqai_info = {
        "model": LightGBMClassifier,
        "train_params": {
            "n_estimators": 1000,
            "learning_rate": 0.01,
            "max_depth": 8,
            "num_leaves": 31,
            "min_child_samples": 20,
            "reg_alpha": 0.1,
            "reg_lambda": 0.1,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
            "random_state": 42,
            "n_jobs": -1,
            "verbosity": -1
        },
    }
    
    def informative_pairs(self):
        return []
    
    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # === PRICE INDICATORS ===
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)
        dataframe['rsi_6'] = ta.RSI(dataframe, timeperiod=6)
        dataframe['rsi_12'] = ta.RSI(dataframe, timeperiod=12)
        
        # MACD
        macd = ta.MACD(dataframe)
        dataframe['macd'] = macd['macd']
        dataframe['macdsignal'] = macd['macdsignal']
        dataframe['macdhist'] = macd['macdhist']
        
        # Bollinger Bands
        bollinger = ta.BBANDS(dataframe, timeperiod=20, nbdevup=2.0, nbdevdn=2.0)
        dataframe['bb_lowerband'] = bollinger['lowerband']
        dataframe['bb_middleband'] = bollinger['middleband']
        dataframe['bb_upperband'] = bollinger['upperband']
        dataframe['bb_width'] = (dataframe['bb_upperband'] - dataframe['bb_lowerband']) / dataframe['bb_middleband']
        dataframe['bb_percent'] = (dataframe['close'] - dataframe['bb_lowerband']) / (dataframe['bb_upperband'] - dataframe['bb_lowerband'])
        
        # EMAs
        dataframe['ema_9'] = ta.EMA(dataframe, timeperiod=9)
        dataframe['ema_21'] = ta.EMA(dataframe, timeperiod=21)
        dataframe['ema_50'] = ta.EMA(dataframe, timeperiod=50)
        dataframe['ema_100'] = ta.EMA(dataframe, timeperiod=100)
        dataframe['ema_200'] = ta.EMA(dataframe, timeperiod=200)
        
        # SMAs
        dataframe['sma_20'] = ta.SMA(dataframe, timeperiod=20)
        dataframe['sma_50'] = ta.SMA(dataframe, timeperiod=50)
        
        # === MOMENTUM INDICATORS ===
        dataframe['adx'] = ta.ADX(dataframe)
        dataframe['adxr'] = ta.ADXR(dataframe)
        
        stoch = ta.STOCH(dataframe)
        dataframe['stoch_k'] = stoch['slowk']
        dataframe['stoch_d'] = stoch['slowd']
        
        dataframe['willr'] = ta.WILLR(dataframe)
        dataframe['cci'] = ta.CCI(dataframe)
        dataframe['mfi'] = ta.MFI(dataframe)
        dataframe['mom'] = ta.MOM(dataframe, timeperiod=10)
        dataframe['roc'] = ta.ROC(dataframe, timeperiod=10)
        
        # === VOLATILITY INDICATORS ===
        dataframe['atr'] = ta.ATR(dataframe, timeperiod=14)
        dataframe['atr_percent'] = dataframe['atr'] / dataframe['close'] * 100
        dataframe['natr'] = ta.NATR(dataframe, timeperiod=14)
        
        # === VOLUME INDICATORS ===
        dataframe['volume_sma_20'] = ta.SMA(dataframe['volume'], timeperiod=20)
        dataframe['volume_ratio'] = dataframe['volume'] / dataframe['volume_sma_20']
        dataframe['ad'] = ta.AD(dataframe)
        dataframe['adosc'] = ta.ADOSC(dataframe)
        
        # === PRICE PATTERNS ===
        dataframe['cdl_doji'] = ta.CDLDOJI(dataframe)
        dataframe['cdl_hammer'] = ta.CDLHAMMER(dataframe)
        dataframe['cdl_engulfing'] = ta.CDLENGULFING(dataframe)
        
        # === PRICE CHANGES ===
        dataframe['price_change_1'] = dataframe['close'].pct_change(1)
        dataframe['price_change_3'] = dataframe['close'].pct_change(3)
        dataframe['price_change_5'] = dataframe['close'].pct_change(5)
        dataframe['price_change_10'] = dataframe['close'].pct_change(10)
        dataframe['price_change_20'] = dataframe['close'].pct_change(20)
        
        # === VOLATILITY ===
        dataframe['volatility_5'] = dataframe['close'].rolling(window=5).std() / dataframe['close']
        dataframe['volatility_10'] = dataframe['close'].rolling(window=10).std() / dataframe['close']
        dataframe['volatility_20'] = dataframe['close'].rolling(window=20).std() / dataframe['close']
        
        # === TREND ===
        dataframe['trend_ema'] = (dataframe['ema_9'] - dataframe['ema_21']) / dataframe['ema_21']
        dataframe['trend_sma'] = (dataframe['sma_20'] - dataframe['sma_50']) / dataframe['sma_50']
        
        # === SUPPORT/RESISTANCE ===
        dataframe['high_20'] = dataframe['high'].rolling(window=20).max()
        dataframe['low_20'] = dataframe['low'].rolling(window=20).min()
        dataframe['range_20'] = (dataframe['high_20'] - dataframe['low_20']) / dataframe['low_20']
        
        return dataframe
    
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # FreqAI target: 0=hold, 1=buy, 2=sell
        dataframe['&s-target'] = 0
        
        # Buy conditions (for training data)
        # RSI oversold + MACD bullish + Price below BB lower
        buy_conditions = (
            (dataframe['rsi'] < 35) &
            (dataframe['macd'] > dataframe['macdsignal']) &
            (dataframe['close'] < dataframe['bb_lowerband'] * 1.02) &
            (dataframe['volume_ratio'] > 0.8)
        )
        
        # Sell conditions (for training data)
        # RSI overbought + MACD bearish + Price above BB upper
        sell_conditions = (
            (dataframe['rsi'] > 65) &
            (dataframe['macd'] < dataframe['macdsignal']) &
            (dataframe['close'] > dataframe['bb_upperband'] * 0.98) &
            (dataframe['volume_ratio'] > 0.8)
        )
        
        dataframe.loc[buy_conditions, '&s-target'] = 1
        dataframe.loc[sell_conditions, '&s-target'] = 2
        
        return dataframe
    
    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[:, 'exit_long'] = 0
        return dataframe
    
    def feature_engineering_expand_all(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        Expand features for all timeframes - FreqAI uses this for multi-timeframe analysis
        """
        # Add time-based features
        dataframe['hour'] = dataframe['date'].dt.hour
        dataframe['day_of_week'] = dataframe['date'].dt.dayofweek
        dataframe['day_of_month'] = dataframe['date'].dt.day
        
        # Cyclical encoding
        dataframe['hour_sin'] = np.sin(2 * np.pi * dataframe['hour'] / 24)
        dataframe['hour_cos'] = np.cos(2 * np.pi * dataframe['hour'] / 24)
        dataframe['dow_sin'] = np.sin(2 * np.pi * dataframe['day_of_week'] / 7)
        dataframe['dow_cos'] = np.cos(2 * np.pi * dataframe['day_of_week'] / 7)
        
        return dataframe
    
    def feature_engineering_expand_basic(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        Basic feature expansion - FreqAI uses this for standard features
        """
        return dataframe
    
    def set_freqai_targets(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        Set the targets for FreqAI prediction
        Shift target by 1 candle to predict next candle
        """
        dataframe['&s-target'] = dataframe['&s-target'].shift(-1)
        return dataframe
