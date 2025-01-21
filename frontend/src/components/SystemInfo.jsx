import { Activity, Info, AlertCircle } from 'lucide-react'

export function SystemInfo({ trades }) {
  return (
    <div className="bg-dark-surface rounded-lg p-6 shadow-lg border border-dark-border mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Stats */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            System Statistics
          </h3>
          <div className="space-y-3">
            <div className="bg-dark-bg p-3 rounded-lg">
              <p className="text-sm text-gray-400">Total Trades</p>
              <p className="text-xl font-semibold">{trades.length}</p>
            </div>
            <div className="bg-dark-bg p-3 rounded-lg">
              <p className="text-sm text-gray-400">Trading Volume</p>
              <p className="text-xl font-semibold">
                ${trades.reduce((sum, trade) => sum + (trade.price * trade.quantity), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-dark-bg p-3 rounded-lg">
              <p className="text-sm text-gray-400">Average Price</p>
              <p className="text-xl font-semibold">
                ${trades.length > 0 
                  ? (trades.reduce((sum, trade) => sum + trade.price, 0) / trades.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Matching Rules */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-400" />
            Matching Rules
          </h3>
          <div className="bg-dark-bg p-4 rounded-lg space-y-3">
            <div>
              <h4 className="font-medium text-blue-400">Price-Time Priority</h4>
              <p className="text-sm text-gray-400">Orders are matched based on best price and earliest timestamp</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-400">Bid-Ask Matching</h4>
              <p className="text-sm text-gray-400">Bids must be ≥ Ask price for a match to occur</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-400">Partial Fills</h4>
              <p className="text-sm text-gray-400">Orders can be partially filled if quantities don't match</p>
            </div>
          </div>
        </div>

        {/* System Logs */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-400" />
            Recent System Events
          </h3>
          <div className="bg-dark-bg p-4 rounded-lg h-[200px] overflow-y-auto">
            <div className="space-y-2">
              {trades.map((trade, index) => (
                <div key={index} className="text-sm border-l-2 border-blue-500 pl-2">
                  <span className="text-gray-400">{trade.timestamp}</span>
                  <p className="text-white">
                    Matched {trade.type.toUpperCase()} order at ${trade.price} x{trade.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 