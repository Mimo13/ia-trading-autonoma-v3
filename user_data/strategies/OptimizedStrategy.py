from freqtrade.strategy import IStrategy, CategoricalParameter, DecimalParameter, IntParameter
from pandas import DataFrame
import talib.abstract as ta
from functools import reduce


class OptimizedStrategy(IStrategy):
    """
    Optimized strategy with hyperopt parameters for buy/sell signals only
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
    startup_candle_count = 100
    
    # Hyperopt parameters for buy
    buy_rsi = IntParameter(20, 45, default=35, space="buy")
    buy_macd_enabled = CategoricalParameter([True, False], default=True, space="buy")
    buy_bb_enabled = CategoricalParameter([True, False], default=True, space="buy")
    buy_ema_enabled = CategoricalParameter([True, False], default=True, space="buy")
    buy_volume_factor = DecimalParameter(0.5, 2.0, default=1.0, decimals=1, space="buy")
    
    # Hyperopt parameters for sell
    sell_rsi = IntParameter(55, 80, default=65, space="sell")
    sell_macd_enabled = CategoricalParameter([True, False], default=True, space="sell")
    sell_bb_enabled = CategoricalParameter([True, False], default=True, space="sell")
    
    def informative_pairs(self):
        return []
    
    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)
        
        macd = ta.MACD(dataframe)
        dataframe['macd'] = macd['macd']
        dataframe['macdsignal'] = macd['macdsignal']
        
        bollinger = ta.BBANDS(dataframe, timeperiod=20, nbdevup=2.0, nbdevdn=2.0)
        dataframe['bb_lowerband'] = bollinger['lowerband']
        dataframe['bb_middleband'] = bollinger['middleband']
        dataframe['bb_upperband'] = bollinger['upperband']
        
        dataframe['ema_9'] = ta.EMA(dataframe, timeperiod=9)
        dataframe['ema_21'] = ta.EMA(dataframe, timeperiod=21)
        
        dataframe['volume_sma'] = ta.SMA(dataframe['volume'], timeperiod=20)
        dataframe['volume_ratio'] = dataframe['volume'] / dataframe['volume_sma']
        
        return dataframe
    
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        conditions = []
        
        conditions.append(dataframe['rsi'] < self.buy_rsi.value)
        
        if self.buy_macd_enabled.value:
            conditions.append(dataframe['macd'] > dataframe['macdsignal'])
        
        if self.buy_bb_enabled.value:
            conditions.append(dataframe['close'] < dataframe['bb_middleband'])
        
        if self.buy_ema_enabled.value:
            conditions.append(dataframe['ema_9'] > dataframe['ema_21'])
        
        conditions.append(dataframe['volume_ratio'] > self.buy_volume_factor.value)
        conditions.append(dataframe['volume'] > 0)
        
        if conditions:
            dataframe.loc[reduce(lambda x, y: x & y, conditions), 'enter_long'] = 1
        
        return dataframe
    
    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        conditions = []
        
        conditions.append(dataframe['rsi'] > self.sell_rsi.value)
        
        if self.sell_macd_enabled.value:
            conditions.append(dataframe['macd'] < dataframe['macdsignal'])
        
        if self.sell_bb_enabled.value:
            conditions.append(dataframe['close'] > dataframe['bb_upperband'])
        
        conditions.append(dataframe['volume'] > 0)
        
        if conditions:
            dataframe.loc[reduce(lambda x, y: x & y, conditions), 'exit_long'] = 1
        
        return dataframe
