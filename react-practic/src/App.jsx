import './App.css';
import { useState } from 'react';
import { items } from './data/items.js';
import { cases } from './data/cases.js';
import { rarityLabels } from './data/labels.js';


const transitions = {
  mainWindow:{
     CASE_SELECTED: 'selectCaseWindow',
     OPEN_PROFILE: 'profileWindow'
  },
  selectCaseWindow:{
     BACK_TO_MAIN: 'mainWindow',
     START_OPENING: 'opening'
  },
  opening: {
    OPENING_SUCCEEDED: 'result',
    OPENING_FAILED: 'selectCaseWindow'
  },
  profileWindow:{
   OPEN_INVENTORY: 'inventoryWindow',
   BACK_TO_MAIN: 'mainWindow'
  },
  inventoryWindow:{
   OPEN_PROFILE: 'profileWindow'
  },
  result:{
   ITEM_SOLD: 'selectCaseWindow',
   ITEM_KEPT: 'selectCaseWindow'
  }

}



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
     if (randomWeight < 0 ){
       return item
     }
  }




});



function Header({title,text}){
  return  <header className="site-header">
        <h1>{title}</h1>
        <h2>{text}</h2>
        </header>
}

function Message({message}){

  if(!message){
    return null;
  }

  return <p className="message">{message}</p>

};

function CoinBalance({coins}){
  return <div className="coin-balance">
   <h2>Coins : {coins}</h2>
  </div>
};

function Sell({onSell}){
  return <button onClick={onSell}>sell</button>
}


function ProfilePath({dispatch}){

  return <div className="nav-actions">
    <button className="btn btn-ghost" onClick = {()=>{dispatch({type:'OPEN_PROFILE'})}}>PROFILE</button>
  </div>
};

function MainWindowPath({dispatch,isOpening,isResult}){

  return <div className="nav-actions">
    <button className="btn btn-ghost" disabled={isOpening||isResult} onClick = {()=>{dispatch({type:'BACK_TO_MAIN'})}}>BACK</button>
  </div>
};

function InventoryPath({dispatch}){

  return <div className="nav-actions">
    <button className="btn btn-ghost" onClick = {()=>{dispatch({type:'OPEN_INVENTORY'})}}>INVENTORY</button>
  </div>

}



function ProfileWindow({dispatch}){

  return <div className="profile-window layout">
    <InventoryPath dispatch={dispatch}/> 
    <MainWindowPath dispatch={dispatch}/>
  </div>
};

function InventoryWindow({inventory,dispatch,sellItemOnInventory}){

  return <div className="inventory-window layout">
    <ProfilePath dispatch={dispatch}/> 
   <Inventory inventory={inventory} sellItemOnInventory={sellItemOnInventory} />
  </div>
};

function MainWindow ({dispatch,nameProject,coins}){

  return <main className="main-window">
   <div className="main-top">
   <Header title = {nameProject} text = {''}/>
   <CoinBalance coins = {coins} />
   <ProfilePath dispatch={dispatch} />
   </div>
   <CaseList className="cases" dispatch={dispatch}/>
  </main>
};

function SelectedCaseWindow({coins,isOpening,isResult,viewType,item,keepItem,sellDroppedItem,dispatch,handleOpenCase,selectedCase,message}){

  return <section className="case-panel">
    <div className="panel-top">
    <CoinBalance coins = {coins} />
    <Message message={message} />
    <MainWindowPath dispatch={dispatch} isOpening={isOpening} isResult={isResult} />
    </div>
    <div className="panel-body">
    {viewType === 'result' && 
    <DropResult item={item} keepItem={keepItem} sellDroppedItem={sellDroppedItem} />}
    {viewType !=='result' && 
    <CaseOpening isOpening={isOpening} handleOpenCase={handleOpenCase} selectedCase={selectedCase} />}
    </div>
  </section>

}



function CaseList({dispatch}){
 return <div className="case-list">
      {cases.map((item)=>{
       return <div className="case-card" key = {item.id} >
        <div className="case-image" aria-hidden="true" />
        <div className="case-meta">
          <p className="case-name">{item.name}</p>
          <p className="case-price">${item.price}</p>
        </div>
        <button className="btn btn-primary" onClick ={() =>dispatch({type:'CASE_SELECTED',payload:{caseId:item.id,message:''}})}>OPEN</button>
        </div>
      })}
</div>
};


function CaseOpening({handleOpenCase,selectedCase,isOpening}){
return <div className="case-opening">
    {selectedCase === undefined
    ?<p>case not found</p>
    :<p className="opening-title">{selectedCase.name}</p>}
    <button className="btn btn-primary" disabled = {isOpening || selectedCase === undefined} onClick={handleOpenCase}>
      { isOpening ? 'Opening...' : 'OPEN'}
      </button>
</div>
};

const Inventory = ({inventory,sellItemOnInventory}) => {
    return <div className="inventory-grid">
        {inventory.length === 0
         ? <p className="empty">Inventory is empty</p>
         : inventory.map((item)=>(
          <div className="inventory-card" key={item.dropId} >
            <div className="inventory-thumb" aria-hidden="true" />
            <p className="inventory-name">{item.name}</p>
            <p className="inventory-price">${item.price}</p>
            <Sell onSell={()=>{sellItemOnInventory(item.dropId)}}/>
          </div>
         ))
      }
    </div>


    
};


function DropResult({item,keepItem,sellDroppedItem}){
 
const handleContextMenu=(event)=>{
  event.preventDefault();
  keepItem();
}

 if (item == null){
  return null;
 }

  return <div className = 'last-drop-overlay' onContextMenu={handleContextMenu} >
      <div className='last-drop-card drop-modal' >
        <div className="drop-media" />
        <div className="drop-info">
          <p className="drop-rarity">{rarityLabels[item.rarity]}</p>
          <p className="drop-name">{item.name}</p>
          <p className="drop-price">${item.price}</p>
          <div className="drop-actions">
            <button className="btn btn-primary" onClick={sellDroppedItem}>SELL FOR ${item.price}</button>
            <button className="btn btn-ghost" onClick={keepItem}>ADD INVENTORY</button>
          </div>
        </div>
      </div>
    </div>
};



function App() {
const nameProject = 'Case Opening Simulator';


  const[coins,setCoins] = useState(1000);
  const[inventory,setInventory] = useState([]);
  const[view,setView] = useState({
    type:'mainWindow',
    payload:{
      caseId:null,
      message:'',
      item:null
    }
  });

const selectedCase = cases.find(
  (item)=> item.id === view.payload.caseId
)

  const dispatch = ((action)=>{

   setView((prevView)=>{
    const nextView = transitionsExtractor(
      prevView.type,
      action.type
    )
    if (nextView === prevView.type){
      return prevView
    }

    return {
      type:nextView,
      payload:{
        ...prevView.payload,
        ...(action.payload ?? {})
      }
    }
   })
  })

  
const transitionsExtractor  = ((currentState,event)=>{
    const possibleStates = transitions[currentState]

    if (possibleStates === undefined){
      return currentState
    };

    const nextState = possibleStates[event]

    if (nextState === undefined){
      return currentState
    }

    return nextState

});

const sellDroppedItem = () =>{
  const item = view.payload.item;
  
  if (item == null){
    return;
  }

  setCoins(coins => coins + item.price)

   dispatch({
    type:'ITEM_SOLD',
    payload:{
      item:null
    }
   })
};

const sellItemOnInventory = ((dropId) => {

 if (dropId == null){
    return;
   };

   const findedItem = inventory.find((item)=>item.dropId === dropId);
   
  if(findedItem == null){
      return;
    };

  setCoins((coins)=>{return coins+findedItem.price})
  setInventory((prev)=>prev.filter((item)=>item.dropId !== dropId))

})

const keepItem = () => {
  const item = view.payload.item;

  if (item == null){
    return;
  }

  setInventory((previousInventory)=>{
    return [...previousInventory,item]
});

 dispatch({
  type:'ITEM_KEPT',
  payload:{
    item:null
  }
 })

}

const  handleOpenCase = async ()  => {
  
   if(selectedCase === undefined){
   return;
   }

    if(coins < selectedCase.price)

      {

      setView((prevView)=>{
           return {
            ...prevView,
            payload:{
              ...prevView.payload,
              message:'not enough coins'
            }
           }
        })
         return;
    }
     
   dispatch({
    type:'START_OPENING'
   })
    

   try{
          await delay(1000);

   let caseItems = items.filter((item)=>{
          return selectedCase.itemIds.includes(item.id);
    });

   let randomItem = getRandomItemByWeight(caseItems)
       if(randomItem === undefined){
         throw new Error('No item found on case')
      }
      const newItem = {
        ...randomItem,
        dropId:crypto.randomUUID()
      }

   setCoins((previousCoins )=> {
        if (selectedCase.price === undefined){
          return previousCoins;
        }else
          {
           return previousCoins - selectedCase.price
          }}
        );
  
   dispatch({
        type:'OPENING_SUCCEEDED',
        payload:{
          item:newItem,
          message:''
        }
      })
   
  } catch(error){
         dispatch({
          type:'OPENING_FAILED',
          payload:{
          item:null,
          message:error.message
        }
      })
    
  }
}
  return <div>
 {['selectCaseWindow','opening','result'].includes(view.type) && (
  <SelectedCaseWindow
    coins = {coins}
    dispatch={dispatch} 
    handleOpenCase={handleOpenCase}
    isOpening={view.type === 'opening'}
    isResult={view.type === 'result'}
    message={view.payload.message}
    viewType={view.type}
    item={view.payload.item}
    keepItem={keepItem}
    selectedCase={selectedCase}
    sellDroppedItem={sellDroppedItem}
     />)} 
 {view.type === 'mainWindow' && 
    <MainWindow 
    nameProject = {nameProject} 
    coins = {coins}
    dispatch={dispatch}
     />}   
 {view.type ==='profileWindow'
     && <ProfileWindow 
     dispatch={dispatch}/>}
  {view.type === 'inventoryWindow' && 
    <InventoryWindow 
    inventory = {inventory} 
    dispatch={dispatch}
    sellItemOnInventory={sellItemOnInventory}
    />}
   </div>
};  

 export default App
