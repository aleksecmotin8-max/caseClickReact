import './App.css'
import {useState} from 'react';

 const items = [
     { id: 1, name: 'P250 | Sand Dune',rarity:'common', weight: 500 },
  { id: 2, name: 'AK-47 | Redline',rarity:'epic', weight: 100 }
  ];

const getRandomItemByWeight = ((items) => {
   
  const summWeight = items.reduce((acc,item)=>{
      return acc + item.weight
  },0)

  let randomWeight = Math.floor(Math.random()*summWeight);

  for(let item of items){
    randomWeight -= item.weight
     if (randomWeight <= 0 ){
       return item
     }
  }




})

function Header({title,text}){
  return  <div>
        <h1>{title}</h1>
        <h2>{text}</h2>
        </div>
}

function CoinBalance({coins,handleAddCoin}){
  
   return <div>
    <h2>Coins : {coins}</h2>
    <button onClick={handleAddCoin}>Add coin</button>
   </div>
};

const Inventory = ({inventory}) => {
    return <div>
        {
        inventory.length === 0
         ? <p> Inventory is empty </p>
         :
          inventory.map((item)=>{
          return <p key={item.dropId}>{item.name}</p>
        })
      }
        
     
    </div>


    
  }

function App() {
const nameProject = 'Case Opening Simulator';

  const[message,setMessage] = useState('');
  const[coins,setCoins] = useState(0);
  const[inventory,setInventory] = useState([]);

  const handleAddCoin = () => {
    setCoins(previousCoins => previousCoins + 1)
  }


  const openCase = () => {
    if(coins <5)
      {
         setMessage('Not enough coins')
         
        return
    }
     
     setCoins(previousCoins => previousCoins - 5)

    let randomItem = getRandomItemByWeight(items)

      const newItem = {
        ...randomItem,
        dropId:crypto.randomUUID()
      }
     
       
      setMessage(stateMessage => stateMessage = '')   
      setInventory((previoiusInventory)=>{
        return [...previoiusInventory,newItem]
      })
  }



  return <div>
    <Header title = {nameProject} text = {'sosi jopu'}/>
     <CoinBalance coins = {coins} handleAddCoin={handleAddCoin} />
     <p>{message}</p>
       <button onClick = {openCase}>open Case</button>
    <Inventory  inventory = {inventory} /> 
  </div>
}
 export default App
