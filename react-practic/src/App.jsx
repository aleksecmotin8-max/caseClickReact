import './App.css';
import { useState } from 'react';
import { items } from './data/items.js';
import { cases } from './data/cases.js';
import { rarityLabels } from './data/labels.js';


const getMedian= ((arr)=>{
  if (arr.length === 0){
    return null;
  };

  const sortArr = [...arr].sort((a,b)=>a-b);
  const midArr = Math.floor(sortArr.length/2);

  if(sortArr.length % 2 === 0){
    return (sortArr[midArr-1] + sortArr[midArr])/2;
    };

return sortArr[midArr];

})

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

function LastDrop({lastDrop,closeLastDrop,sellItem,}){
  const handleContextMenu = ((event)=>{
     event.preventDefault();
    closeLastDrop();
  })
if(lastDrop === null){
  return null;
}else {
return <div className = 'last-drop-overlay' onContextMenu={handleContextMenu}>
      <div className='last-drop-card' >
      <button onClick = {()=>{
        closeLastDrop()
        sellItem(lastDrop.dropId)}}>SELL</button>
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
          return <div key={item.dropId} >
            <p>{item.name}</p>
            <button onClick = {()=>{sellItem(item.dropId)}}>SELL</button>
            </div>
        })
      }
        
     
    </div>


    
  };

function ProfilePath({profilePath}){

  return <div>
    <button onClick = {profilePath}> PROFILE</button>
  </div>
};

function MainWindowPath({mainWindowPath,setSelectedCaseId}){

  return <div>
    <button onClick = {()=>{setSelectedCaseId(null);mainWindowPath() }}>BACK</button>
  </div>
};

function InventoryPath({inventoryPath}){

  return <div>

    <button onClick = {inventoryPath}>inventory</button>

  </div>

}

function MainWindow ({nameProject,coins,handleAddCoin,selectCase,profilePath }){

  return <div>
    
   <Header title = {nameProject} text = {'sosi jopu'}/>
   <CoinBalance coins = {coins} handleAddCoin={handleAddCoin} />
   <CaseList selectCase ={selectCase}/>
   <ProfilePath profilePath = {profilePath}/>

  </div>
};

function SelectedCaseWindow({coins,handleAddCoin,profilePath,mainWindowPath,sellItem, closeLastDrop,lastDrop,isOpening,selectedCase, openCase,message,setSelectedCaseId }){

  return <div>
    
    <CoinBalance coins = {coins} handleAddCoin={handleAddCoin} />
    <Message message={message}/>
     <MainWindowPath mainWindowPath={mainWindowPath} setSelectedCaseId={setSelectedCaseId}/>
    <ProfilePath profilePath = {profilePath}/>
    <LastDrop lastDrop = {lastDrop} closeLastDrop={closeLastDrop} sellItem={sellItem} /> 
      <CaseOpening openCase = {openCase} selectedCase={selectedCase}  isOpening = {isOpening}/>
  </div>

}

function ProfileWindow({mainWindowPath,inventoryPath}){

  return <div>

    <InventoryPath inventoryPath={inventoryPath}/> 
    <MainWindowPath mainWindowPath={mainWindowPath}/>

  </div>
}

function InventoryWindow({inventory,sellItem,profilePath}){

  return <div>
   
    <ProfilePath profilePath = {profilePath}/>
   <Inventory inventory = {inventory} sellItem={sellItem}/>

  </div>
}

function App() {
const nameProject = 'Case Opening Simulator';

  const[lastDrop,setLastDrop] = useState(null);
  const[isOpening,setIsOpening] = useState (false);
  const[message,setMessage] = useState('');
  const[coins,setCoins] = useState(1000);
  const[inventory,setInventory] = useState([]);
  const[selectedCaseId,setSelectedCaseId] = useState(null);
  const[howWindow,setHowWindow] = useState('mainWindow')


  
  const profilePath = (()=>
    setHowWindow('profileWindow'));

  const mainWindowPath = (()=>{
    setHowWindow('mainWindow')
  });

  const inventoryPath = (()=>{
    setHowWindow('inventoryWindow')
  })
  

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
      setMessage('')   
      setInventory((previoiusInventory)=>{
        return [...previoiusInventory,newItem]
      })
  }catch(error){
    
       setMessage(error.message);
      
  }finally{

    setIsOpening(false)

  }
  }
  return <div>{
    selectedCaseId !== null
   ? <div> <SelectedCaseWindow coins = {coins} handleAddCoin={handleAddCoin}  mainWindowPath={mainWindowPath} profilePath = {profilePath} 
     lastDrop = {lastDrop} closeLastDrop={closeLastDrop} sellItem={sellItem}  openCase = {openCase} selectedCase={selectedCase}  isOpening = {isOpening}
     message={message} setSelectedCaseId = {setSelectedCaseId} 
     />
   </div>
  :<div>
    {howWindow === 'mainWindow' && <MainWindow nameProject = {nameProject} coins = {coins} handleAddCoin={handleAddCoin} selectCase ={selectCase}
     profilePath = {profilePath} setSelectedCaseId = {setSelectedCaseId}/>}   
    {howWindow ==='profileWindow' && <ProfileWindow  inventoryPath={inventoryPath} mainWindowPath={mainWindowPath} setSelectedCaseId = {setSelectedCaseId}/>}
    {howWindow === 'inventoryWindow' && <InventoryWindow inventory = {inventory} sellItem={sellItem} profilePath = {profilePath} />}
  </div>}
   </div>
};  

  
 export default App
 
