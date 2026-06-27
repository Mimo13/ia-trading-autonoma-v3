from freqtrade.strategy import IStrategy, merge_informative_pair
from freqtrade.freqai.prediction_models.LightGBMClassifier import LightGBMClassifier
from pandas import DataFrame
import talib.abstract as ta
import numpy as np


class FreqAI_LightGBM_Strategy(IStrategy):
    """
    FreqAI Strategy using LightGBM Classifier
    Predicts buy/sell/hold signals using technical indicators
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
    startup_candle_count = 100
    
    # FreqAI model configuration
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
            "random_state": 42
        },
    }
    
    def informative_pairs(self):
        return []
    
    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # RSI
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)
        
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
        dataframe['ema_20'] = ta.EMA(dataframe, timeperiod=20)
        dataframe['ema_50'] = ta.EMA(dataframe, timeperiod=50)
        
        # Volume
        dataframe['volume_sma_20'] = ta.SMA(dataframe['volume'], timeperiod=20)
        dataframe['volume_ratio'] = dataframe['volume'] / dataframe['volume_sma_20']
        
        # ATR
        dataframe['atr'] = ta.ATR(dataframe, timeperiod=14)
        dataframe['atr_percent'] = dataframe['atr'] / dataframe['close'] * 100
        
        # Stochastic
        stoch = ta.STOCH(dataframe)
        dataframe['stoch_k'] = stoch['slowk']
        dataframe['stoch_d'] = stoch['slowd']
        
        # ADX
        dataframe['adx'] = ta.ADX(dataframe)
        
        # Price changes
        dataframe['price_change_1'] = dataframe['close'].pct_change(1)
        dataframe['price_change_5'] = dataframe['close'].pct_change(5)
        dataframe['price_change_10'] = dataframe['close'].pct_change(10)
        
        # Volatility
        dataframe['volatility'] = dataframe['close'].rolling(window=20).std() / dataframe['close']
        
        # Momentum
        dataframe['momentum'] = ta.MOM(dataframe, timeperiod=10)
        
        # Williams %R
        dataframe['willr'] = ta.WILLR(dataframe)
        
        # CCI
        dataframe['cci'] = ta.CCI(dataframe)
        
        # MFI
        dataframe['mfi'] = ta.MFI(dataframe)
        
        return dataframe
    
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # Target for FreqAI training
        dataframe['&s-target'] = 0  # hold
        
        # Buy conditions
        buy_conditions = (
            (dataframe['rsi'] < 35) &
            (dataframe['macd'] > dataframe['macdsignal']) &
            (dataframe['close'] < dataframe['bb_lowerband'] * 1.02)
        )
        
        # Sell conditions
        sell_conditions = (
            (dataframe['rsi'] > 65) &
            (dataframe['macd'] < dataframe['macdsignal']) &
            (dataframe['close'] > dataframe['bb_upperband'] * 0.98)
        )
        
        dataframe.loc[buy_conditions, '&s-target'] = 1
        dataframe.loc[sell_conditions, '&s-target'] = 2
        
        return dataframe
    
    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[:, 'exit_long'] = 0
        return dataframe
    
    def feature_engineering_expand_all(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        return dataframe
    
    def feature_engineering_expand_basic(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        return dataframe
    
    def set_freqai_targets(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe['&s-target'] = dataframe['&s-target'].shift(-1)
        return dataframe
