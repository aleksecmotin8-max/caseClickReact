import './App.css';
import { useState } from 'react';
import { items } from './data/items.js';
import { cases } from './data/cases.js';
import { rarityLabels } from './data/labels.js';

const delay = ((ms)=>{
  return new Promise((resolve,reject)=>{
    setTimeout (()=>{
      const randomNumber = Math.random()
      if (randomNumber<0.1){
        reject(new Error('Server blocked'))
      } else {
        resolve()}

    },ms)
  })
})

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




});


function BackCaseList({setSelectedCaseId}){
  return <div> 
    <button onClick ={()=>setSelectedCaseId(null)}>back</button>
  </div>
}

function CaseList({selectCase}){
 return <div>
      {cases.map((item)=>{
       return <div key = {item.id} >
        <p>{item.name}</p>
        <p>{item.price}</p>
        <button onClick ={() => selectCase(item.id)}>open</button>
        </div>
      })}
</div>
}



function CaseOpening({openCase,selectedCase,isOpening}){

return <div>
   <p>{selectedCase.name}</p>
    <button disabled = {isOpening} onClick = {openCase}>
      {isOpening ? 'Opening...' : 'OPEN'}
      </button>
</div>
};


function Message({message}){

  if(!message){
    return null;
  }

  return <p>{message}</p>

};

function LastDrop({lastDrop,closeLastDrop,sellItem}){
  const handleContextMenu = ((event)=>{
     event.preventDefault();
    closeLastDrop();
  })
if(lastDrop === null){
  return null;
}else {
return <div className = 'last-drop-overlay' onContextMenu={handleContextMenu}>
      <div className='last-drop-card' >
      <button onClick = {()=>{sellItem(lastDrop.dropId)}}>SELL</button>
      <p>{rarityLabels[lastDrop.rarity]}</p> 
      <p>{lastDrop.name}</p>
      <p>{lastDrop.price}</p>
    </div>
</div>
 }
}

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

const Inventory = ({inventory,sellItem}) => {
    return <div>
        {
        inventory.length === 0
         ? <p> Inventory is empty </p>
         :
          inventory.map((item)=>{
          return <div>
            <p key={item.dropId}>{item.name}</p>
            <button onClick = {()=>{sellItem(item.dropId)}}>SELL</button>
            </div>
        })
      }
        
     
    </div>


    
  }

function App() {
const nameProject = 'Case Opening Simulator';

  const[lastDrop,setLastDrop] = useState(null);
  const[isOpening,setIsOpening] = useState (false);
  const[message,setMessage] = useState('');
  const[coins,setCoins] = useState(1000);
  const[inventory,setInventory] = useState([]);
  const [selectedCaseId,setSelectedCaseId] = useState(null);
  


  const sellItem = (dropId)=>{
   let currentItem = inventory.find((item)=>{
    return item.dropId === dropId
   });
   if (currentItem === undefined){
    return;
   }
    setInventory(inventory.filter((item)=>{
       return item.dropId !== currentItem.dropId
     }));

    setCoins(coinsState => coinsState + currentItem.price);

    setLastDrop(null)

  };

  const closeLastDrop = () => {
    setLastDrop(null)
  };

  const handleAddCoin = () => {
    setCoins(previousCoins => previousCoins + 1)
  };

 const selectCase = (caseId)=>{
    setSelectedCaseId(caseId)
  };


let selectedCase = cases.find((item)=>{
    return item.id === selectedCaseId
  });

  const openCase = async ()  => {
  
    if(coins < selectedCase.price)
      {

         setMessage('Not enough coins') 
        return
    }
     
    setIsOpening(true)
     setCoins(previousCoins => previousCoins - selectedCase.price);

   try {
          await delay(1000);
   let caseItems = items.filter((item)=>{
          return selectedCase.itemIds.includes(item.id)
    })

    let randomItem = getRandomItemByWeight(caseItems)

      const newItem = {
        ...randomItem,
        dropId:crypto.randomUUID()
      }
      
      setLastDrop(newItem)
      setMessage(stateMessage => stateMessage = '')   
      setInventory((previoiusInventory)=>{
        return [...previoiusInventory,newItem]
      })
  }catch(error){
    
       setMessage(error.message);
      
  }finally{

    setIsOpening(false)

  }


  }
  return <div>
   
    <Header title = {nameProject} text = {'sosi jopu'}/>
     <CoinBalance coins = {coins} handleAddCoin={handleAddCoin} />
    <LastDrop lastDrop = {lastDrop} closeLastDrop={closeLastDrop} sellItem={sellItem}/>
      <Message  message = {message}/>
     { selectedCaseId === null ?<CaseList selectCase ={selectCase}/>
    :<> <BackCaseList setSelectedCaseId={setSelectedCaseId}/>
       <CaseOpening openCase = {openCase} selectedCase={selectedCase}  isOpening = {isOpening}/>
   </>
     }
  <Inventory  inventory = {inventory} sellItem={sellItem}/> 
  </div>

};  

 
 export default App
