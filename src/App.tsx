import React, {useEffect, useState} from 'react';
import './App.css';


function App() {
  const [orders, setOrders] = useState<any[]>([]);
  const [ws, setWs] = useState<any>(null);
  const connect_ws = () => {
    let ws = new WebSocket('ws://127.0.0.1:8000/ws');
    ws.onopen = event => {
      ws.send(JSON.stringify({event: 'get_orders'}));
    }
    ws.onclose = event => {
      setTimeout(() => connect_ws(), 500);
    }
    ws.onerror = event => {
      ws.close();
    }
    setWs(ws)
  }
  useEffect(() => {
    connect_ws();
    console.log(ws);
  }, []);

  useEffect(() => {
    if (ws) {
      // @ts-ignore
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          switch (msg.event) {
            case 'get_orders':
              setOrders(msg.data)
              break
            case 'update_status':
              const index = orders.findIndex(i => msg.data.id === i.id)
              if (index > -1) {
                const _orders = [...orders]
                _orders[index].status = msg.data.status
                setOrders(_orders)
              }
              break
            case 'new_order':
              setOrders([msg.data, ...orders])
              break
          }
        } catch (e) {
        }
      }
    }
    return () => {
    }
  }, [orders, ws]);
  const updateOrderStatus = (orderId: number, status: string) => {
    ws.send(JSON.stringify({event: 'update_status', data: {status, order_id: orderId}}))
  }
  return (
    <div className="App">
      <div className="">
        {orders.map((order) => (
          <div className="grid grid-cols-3 p-3">
            <div className="text-xl">Order #{order.id}</div>
            <div className="">{order.price}W</div>
            <div className="">
              <select name="status" value={order.status} onChange={e => {
                updateOrderStatus(order.id, e.target.value)
              }}>
                <option value="Received">Received</option>
                <option value="Processing">Processing</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
