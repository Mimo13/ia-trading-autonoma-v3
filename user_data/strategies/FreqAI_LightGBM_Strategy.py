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
    
    # Optimal timeframe
    timeframe = '5m'
    
    # Can this strategy go short?
    can_short: bool = False
    
    # Minimal ROI designed for the strategy
    minimal_roi = {
        "60": 0.01,
        "30": 0.02,
        "0": 0.04
    }
    
    # Optimal stoploss
    stoploss = -0.10
    
    # Trailing stoploss
    trailing_stop = True
    trailing_stop_positive = 0.01
    trailing_stop_positive_offset = 0.02
    trailing_only_offset_is_reached = True
    
    # Run "populate_indicators()" only for new candle
    process_only_new_candles = True
    
    # Use exit signal
    use_exit_signal = True
    exit_profit_only = False
    ignore_roi_if_entry_signal = False
    
    # Number of candles the strategy requires before producing valid signals
    startup_candle_count: int = 100
    
    # FreqAI settings
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
    
    # Feature engineering parameters
    rsi_period = 14
    macd_fast = 12
    macd_slow = 26
    macd_signal = 9
    bb_period = 20
    bb_std = 2
    ema_short = 20
    ema_long = 50
    
    def informative_pairs(self):
        return []
    
    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # RSI
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=self.rsi_period)
        
        # MACD
        macd = ta.MACD(dataframe, fastperiod=self.macd_fast, slowperiod=self.macd_slow, signalperiod=self.macd_signal)
        dataframe['macd'] = macd['macd']
        dataframe['macdsignal'] = macd['macdsignal']
        dataframe['macdhist'] = macd['macdhist']
        
        # Bollinger Bands
        bollinger = ta.BBANDS(dataframe, timeperiod=self.bb_period, nbdevup=self.bb_std, nbdevdn=self.bb_std)
        dataframe['bb_lowerband'] = bollinger['lowerband']
        dataframe['bb_middleband'] = bollinger['middleband']
        dataframe['bb_upperband'] = bollinger['upperband']
        dataframe['bb_width'] = (dataframe['bb_upperband'] - dataframe['bb_lowerband']) / dataframe['bb_middleband']
        dataframe['bb_percent'] = (dataframe['close'] - dataframe['bb_lowerband']) / (dataframe['bb_upperband'] - dataframe['bb_lowerband'])
        
        # EMAs
        dataframe['ema_20'] = ta.EMA(dataframe, timeperiod=self.ema_short)
        dataframe['ema_50'] = ta.EMA(dataframe, timeperiod=self.ema_long)
        
        # Volume indicators
        dataframe['volume_sma_20'] = ta.SMA(dataframe['volume'], timeperiod=20)
        dataframe['volume_ratio'] = dataframe['volume'] / dataframe['volume_sma_20']
        
        # ATR for volatility
        dataframe['atr'] = ta.ATR(dataframe, timeperiod=14)
        dataframe['atr_percent'] = dataframe['atr'] / dataframe['close'] * 100
        
        # Stochastic
        stoch = ta.STOCH(dataframe)
        dataframe['stoch_k'] = stoch['slowk']
        dataframe['stoch_d'] = stoch['slowd']
        
        # ADX for trend strength
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
        # FreqAI will handle the entry signals based on the model predictions
        # The model will predict: 0 = hold, 1 = buy, 2 = sell
        
        # Add the target variable for training
        # This is what FreqAI will try to predict
        dataframe['&s-target'] = 0  # Default: hold
        
        # Define buy conditions (for training data)
        buy_conditions = (
            (dataframe['rsi'] < 30) &
            (dataframe['macd'] > dataframe['macdsignal']) &
            (dataframe['close'] < dataframe['bb_lowerband']) &
            (dataframe['ema_20'] > dataframe['ema_50']) &
            (dataframe['volume_ratio'] > 1.0)
        )
        
        # Define sell conditions (for training data)
        sell_conditions = (
            (dataframe['rsi'] > 70) &
            (dataframe['macd'] < dataframe['macdsignal']) &
            (dataframe['close'] > dataframe['bb_upperband']) &
            (dataframe['volume_ratio'] > 1.0)
        )
        
        dataframe.loc[buy_conditions, '&s-target'] = 1
        dataframe.loc[sell_conditions, '&s-target'] = 2
        
        return dataframe
    
    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # FreqAI will handle exit signals
        dataframe.loc[:, 'exit_long'] = 0
        return dataframe
    
    def feature_engineering_expand_all(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        FreqAI will use this method to expand features for all timeframes
        """
        return dataframe
    
    def feature_engineering_expand_basic(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        FreqAI will use this method to expand basic features
        """
        return dataframe
    
    def set_freqai_targets(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        Set the targets for FreqAI prediction
        """
        dataframe['&s-target'] = dataframe['&s-target'].shift(-1)
        return dataframe
