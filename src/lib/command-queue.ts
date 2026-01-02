import { Firestore, collection, doc, setDoc } from 'firebase/firestore';

export interface TradeCommand {
  action: 'OPEN' | 'CLOSE' | 'MODIFY';
  details: {
    symbol?: string;
    volume?: number;
    type?: 'BUY' | 'SELL';
    stopLoss?: number;
    takeProfit?: number;
    firestoreTradeId?: string;
    [key: string]: any;
  };
  timestamp?: string;
  status?: 'PENDING' | 'EXECUTED' | 'FAILED';
}

export async function sendTradeCommand(
  firestore: Firestore,
  command: TradeCommand
): Promise<string> {
  try {
    const commandsCollection = collection(firestore, 'tradeCommands');
    const commandRef = doc(commandsCollection);
    
    const fullCommand = {
      ...command,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
    };
    
    await setDoc(commandRef, fullCommand);
    console.log(`✅ Trade command sent: ${command.action}`, command.details);
    return commandRef.id;
  } catch (error) {
    console.error('❌ Failed to send trade command:', error);
    throw error;
  }
}
