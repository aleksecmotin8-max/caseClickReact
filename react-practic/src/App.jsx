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



/* eslint-disable-next-line no-unused-vars */
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
      if (randomNumber<0.0001){
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
    <h2>Монеты: {coins}</h2>
  </div>
};

function RarityToggle({inventoryControls,setInventoryControls}){
  return (
    <select className="control-select" value={inventoryControls.rarity} onChange={(e)=>{
      setInventoryControls((prev) => ({
        ...prev,
        rarity: e.target.value
      }))
    }}>
      <option value="all">Все</option>
      <option value="common">Обычные</option>
      <option value="rare">Редкие</option>
      <option value="epic">Эпические</option>
      <option value="legendary">Легендарные</option>
    </select>
  )
}

function SortBySelect({inventoryControls,setInventoryControls}){
  return (
    <select className="control-select" value={inventoryControls.sortBy} onChange={(e)=>{
      setInventoryControls((prev)=>({
        ...prev,
        sortBy: e.target.value
      }))
    }}>
      <option value="date">По дате</option>
      <option value="price">По цене</option>
      <option value="rarity">По редкости</option>
    </select>
  )
}

function ButtonDirection({inventoryControls,setInventoryControls}){
  return (
    <button className="btn btn-ghost sort-direction" onClick={()=>{
      setInventoryControls((prev)=>(({
        ...prev,
        sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc'
      })))
    }}>
      {inventoryControls.sortDirection === 'asc' ? 'По возрастанию' : 'По убыванию'}
    </button>
  )
}


function Sell({onSell}){
  return <button className="btn btn-ghost" onClick={onSell}>Продать</button>
}


function ProfilePath({dispatch}){

  return <div className="nav-actions">
    <button className="btn btn-ghost" onClick = {()=>{dispatch({type:'OPEN_PROFILE'})}}>Профиль</button>
  </div>
};

function MainWindowPath({dispatch,isOpening,isResult}){

  return <div className="nav-actions">
    <button className="btn btn-ghost" disabled={isOpening||isResult} onClick = {()=>{dispatch({type:'BACK_TO_MAIN'})}}>Назад</button>
  </div>
};

function InventoryPath({dispatch}){

  return <div className="nav-actions">
    <button className="btn btn-ghost" onClick = {()=>{dispatch({type:'OPEN_INVENTORY'})}}>Инвентарь</button>
  </div>

}



function ProfileWindow({dispatch}){

  return <div className="profile-window layout">
    <InventoryPath dispatch={dispatch}/> 
    <MainWindowPath dispatch={dispatch}/>
  </div>
};

function InventoryWindow({visibleInventory,dispatch,sellItemOnInventory,inventoryControls,setInventoryControls}){

  return <div className="inventory-window layout">
    <ProfilePath dispatch={dispatch}/> 
    <div className="inventory-controls">
      <SortBySelect inventoryControls={inventoryControls} setInventoryControls={setInventoryControls} />
      <RarityToggle inventoryControls={inventoryControls} setInventoryControls={setInventoryControls} />
      <ButtonDirection inventoryControls={inventoryControls} setInventoryControls={setInventoryControls} />
    </div>
   <Inventory inventory={visibleInventory} sellItemOnInventory={sellItemOnInventory} />
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
        <button className="btn btn-primary" onClick ={() =>dispatch({type:'CASE_SELECTED',payload:{caseId:item.id,message:''}})}>Открыть</button>
        </div>
      })}
</div>
};


function CaseOpening({handleOpenCase,selectedCase,isOpening}){
return <div className="case-opening">
    {selectedCase === undefined
    ?<p>Кейс не найден</p>
    :<p className="opening-title">{selectedCase.name}</p>}
    <button className="btn btn-primary" disabled = {isOpening || selectedCase === undefined} onClick={handleOpenCase}>
      { isOpening ? 'Открытие...' : 'Открыть'}
      </button>
</div>
};

const Inventory = ({inventory,sellItemOnInventory}) => {
    if (!inventory || inventory.length === 0) {
      return null;
    }
    return (
      <div className="inventory-grid">
        {inventory.map((item)=>(
          <div className="inventory-card" key={item.dropId} >
            <div className="inventory-thumb" aria-hidden="true" />
            <p className="inventory-name">{item.name}</p>
            <p className="inventory-price">${item.price}</p>
            <Sell onSell={()=>{sellItemOnInventory(item.dropId)}}/>
          </div>
         ))}
      </div>
    )
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
            <button className="btn btn-primary" onClick={sellDroppedItem}>Продать за ${item.price}</button>
            <button className="btn btn-ghost" onClick={keepItem}>В инвентарь</button>
          </div>
        </div>
      </div>
    </div>
};



function App() {
const nameProject = 'Симулятор открытия кейсов';


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
  const[inventoryControls,setInventoryControls] = useState({
    sortBy:'date',
    sortDirection:'desc',
    rarity:'all'
  });
  const[showSettings,setShowSettings] = useState(false);
  const toggleSettings = () => setShowSettings((prev)=>!prev);

const rarityOrder = {
  common:1,
  rare:2,
  epic:3,
  legendary:4
}

const compareItems = (a, b) => {
  let comparison = 0

  if (inventoryControls.sortBy === 'price') {
    comparison = a.price - b.price
  }

  if (inventoryControls.sortBy === 'date') {
    comparison = a.droppedAt - b.droppedAt
  }

  if (inventoryControls.sortBy === 'rarity') {
    comparison =
      rarityOrder[a.rarity] - rarityOrder[b.rarity]
  }

  const direction =
    inventoryControls.sortDirection === 'asc' ? 1 : -1

  return comparison * direction
}


const visibleInventory = inventory.filter((item) => {
  if (inventoryControls.rarity === 'all') {
    return true;
  }
  return item.rarity === inventoryControls.rarity;
}).sort(compareItems);


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
        dropId:crypto.randomUUID(),
        droppedAt:Date.now()
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
  return <div className="app-shell">
    <button className="btn btn-ghost settings-trigger" onClick={toggleSettings}>Настройки</button>
    {showSettings && (
      <div className="settings-panel">
        <div className="settings-panel__header">Настройки</div>
      </div>
    )}
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
    visibleInventory={visibleInventory}
    dispatch={dispatch}
    sellItemOnInventory={sellItemOnInventory}
    inventoryControls={inventoryControls}
    setInventoryControls={setInventoryControls}
    />}
   </div>
};  

 export default App
