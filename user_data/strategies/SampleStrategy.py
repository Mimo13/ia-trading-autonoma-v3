from freqtrade.strategy import IStrategy, merge_informative_pair
from pandas import DataFrame
import talib.abstract as ta


class SampleStrategy(IStrategy):
    """
    Sample strategy for IA Trading v3
    Uses RSI and MACD for entry/exit signals
    Relaxed conditions for more signals in dry-run
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
        "0": 0.03
    }
    
    # Optimal stoploss
    stoploss = -0.08
    
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
    startup_candle_count: int = 50
    
    # Strategy parameters - relaxed for more signals
    buy_rsi = 40
    sell_rsi = 60
    
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
        
        # EMA
        dataframe['ema_20'] = ta.EMA(dataframe, timeperiod=20)
        dataframe['ema_50'] = ta.EMA(dataframe, timeperiod=50)
        
        # Volume SMA
        dataframe['volume_sma'] = ta.SMA(dataframe['volume'], timeperiod=20)
        
        return dataframe
    
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # Relaxed conditions - any 2 of 3 conditions
        rsi_buy = dataframe['rsi'] < self.buy_rsi
        macd_buy = dataframe['macd'] > dataframe['macdsignal']
        bb_buy = dataframe['close'] < dataframe['bb_middleband']
        
        # At least 2 conditions must be true
        dataframe.loc[
            (
                ((rsi_buy & macd_buy) | (rsi_buy & bb_buy) | (macd_buy & bb_buy)) &
                (dataframe['volume'] > 0)
            ),
            'enter_long'] = 1
        
        return dataframe
    
    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # Relaxed exit conditions
        rsi_sell = dataframe['rsi'] > self.sell_rsi
        macd_sell = dataframe['macd'] < dataframe['macdsignal']
        bb_sell = dataframe['close'] > dataframe['bb_upperband']
        
        # At least 2 conditions must be true
        dataframe.loc[
            (
                ((rsi_sell & macd_sell) | (rsi_sell & bb_sell) | (macd_sell & bb_sell)) &
                (dataframe['volume'] > 0)
            ),
            'exit_long'] = 1
        
        return dataframe
