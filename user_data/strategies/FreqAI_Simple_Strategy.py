from freqtrade.strategy import IStrategy, merge_informative_pair
from pandas import DataFrame
import talib.abstract as ta
import numpy as np
from datetime import datetime


class FreqAI_Simple_Strategy(IStrategy):
    """
    Simple FreqAI Strategy that works with Freqtrade's built-in FreqAI
    Uses basic indicators and lets FreqAI handle the ML part
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
    startup_candle_count = 200
    
    # FreqAI will be configured via config file
    
    def informative_pairs(self):
        return []
    
    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # Basic indicators for FreqAI to use
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)
        
        macd = ta.MACD(dataframe)
        dataframe['macd'] = macd['macd']
        dataframe['macdsignal'] = macd['macdsignal']
        dataframe['macdhist'] = macd['macdhist']
        
        bollinger = ta.BBANDS(dataframe, timeperiod=20, nbdevup=2.0, nbdevdn=2.0)
        dataframe['bb_lowerband'] = bollinger['lowerband']
        dataframe['bb_middleband'] = bollinger['middleband']
        dataframe['bb_upperband'] = bollinger['upperband']
        dataframe['bb_width'] = (dataframe['bb_upperband'] - dataframe['bb_lowerband']) / dataframe['bb_middleband']
        dataframe['bb_percent'] = (dataframe['close'] - dataframe['bb_lowerband']) / (dataframe['bb_upperband'] - dataframe['bb_lowerband'])
        
        dataframe['ema_9'] = ta.EMA(dataframe, timeperiod=9)
        dataframe['ema_21'] = ta.EMA(dataframe, timeperiod=21)
        dataframe['ema_50'] = ta.EMA(dataframe, timeperiod=50)
        
        dataframe['adx'] = ta.ADX(dataframe)
        
        dataframe['volume_sma'] = ta.SMA(dataframe['volume'], timeperiod=20)
        dataframe['volume_ratio'] = dataframe['volume'] / dataframe['volume_sma']
        
        dataframe['atr'] = ta.ATR(dataframe, timeperiod=14)
        dataframe['atr_percent'] = dataframe['atr'] / dataframe['close'] * 100
        
        # Target for FreqAI
        # 1 = buy signal, 0 = hold/sell
        dataframe['&s-target'] = 0
        
        # Buy conditions
        buy_conditions = (
            (dataframe['rsi'] < 35) &
            (dataframe['macd'] > dataframe['macdsignal']) &
            (dataframe['close'] < dataframe['bb_lowerband'] * 1.02) &
            (dataframe['volume_ratio'] > 0.8)
        )
        
        dataframe.loc[buy_conditions, '&s-target'] = 1
        
        return dataframe
    
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # FreqAI will handle entry signals based on prediction
        # We set enter_long when FreqAI predicts buy (&s-target = 1)
        dataframe.loc[dataframe['&s-target'] == 1, 'enter_long'] = 1
        return dataframe
    
    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[:, 'exit_long'] = 0
        return dataframe
    
    def feature_engineering_expand_all(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # Add time features for FreqAI
        dataframe['hour'] = dataframe['date'].dt.hour
        dataframe['day_of_week'] = dataframe['date'].dt.dayofweek
        
        # Cyclical encoding
        dataframe['hour_sin'] = np.sin(2 * np.pi * dataframe['hour'] / 24)
        dataframe['hour_cos'] = np.cos(2 * np.pi * dataframe['hour'] / 24)
        
        return dataframe
    
    def feature_engineering_expand_basic(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        return dataframe
    
    def set_freqai_targets(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # Shift target to predict next candle
        dataframe['&s-target'] = dataframe['&s-target'].shift(-1)
        return dataframe
