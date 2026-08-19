import './App.css';
import { useEffect, useRef, useState } from 'react';
import { items } from './data/items.js';
import { cases } from './data/cases.js';
import { rarityLabels } from './data/labels.js';
import { Routes, Route, Link, useParams } from 'react-router';

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


function ProfilePath(){

  return <div className="nav-actions">
    <Link className="btn btn-ghost" to="/profile">Профиль</Link>
  </div>
};

function InventoryPath(){

  return <div className="nav-actions">
    <Link className="btn btn-ghost" to="/inventory">Инвентарь</Link>
  </div>

}



function ProfileWindow(){

  return <div className="profile-window layout">
    <InventoryPath />
  </div>
};

function InventoryWindow({visibleInventory,sellItemOnInventory,inventoryControls,setInventoryControls}){

  return <div className="inventory-window layout">
    <ProfilePath />
    <div className="inventory-controls">
      <SortBySelect inventoryControls={inventoryControls} setInventoryControls={setInventoryControls} />
      <RarityToggle inventoryControls={inventoryControls} setInventoryControls={setInventoryControls} />
      <ButtonDirection inventoryControls={inventoryControls} setInventoryControls={setInventoryControls} />
    </div>
   <Inventory inventory={visibleInventory} sellItemOnInventory={sellItemOnInventory} />
  </div>
};

function MainWindow ({nameProject,coins}){

  return <main className="main-window">
   <div className="main-top">
   <Header title = {nameProject} text = {''}/>
   <CoinBalance coins = {coins} />
   <ProfilePath />
   </div>
   <CaseList className="cases" />
  </main>
};


function SelectedCaseWindow({ coins, setCoins, keepItem, sellDroppedItem }) {
  const { caseId } = useParams();
  const selectedCase = cases.find((item) => item.id === Number(caseId));

  const [status, setStatus] = useState('idle');
  const [droppedItem, setDroppedItem] = useState(null);
  const [message, setMessage] = useState('');

  const handleOpenCase = async () => {
    if (selectedCase === undefined) {
      return;
    }

    if (coins < selectedCase.price) {
      setMessage('Недостаточно монет');
      return;
    }

    setStatus('opening');
    setMessage('');

    try {
      await delay(1000);

      const caseItems = items.filter((item) => selectedCase.itemIds.includes(item.id));
      const randomItem = getRandomItemByWeight(caseItems);
      if (randomItem === undefined) {
        throw new Error('No item found on case');
      }

      const newItem = {
        ...randomItem,
        dropId: crypto.randomUUID(),
        droppedAt: Date.now()
      };

      setCoins((prevCoins) => prevCoins - selectedCase.price);
      setDroppedItem(newItem);
      setStatus('result');
    } catch (error) {
      setMessage(error.message);
      setStatus('idle');
    }
  };

  const handleSell = () => {
    sellDroppedItem(droppedItem);
    setDroppedItem(null);
    setStatus('idle');
  };

  const handleKeep = () => {
    keepItem(droppedItem);
    setDroppedItem(null);
    setStatus('idle');
  };

  return (
    <section className="case-panel">
      <div className="panel-top">
        <CoinBalance coins={coins} />
        <Message message={message} />
      </div>

      <div className="panel-body">
        {status === 'result' ? (
          <DropResult item={droppedItem} keepItem={handleKeep} sellDroppedItem={handleSell} />
        ) : (
          <CaseOpening
            isOpening={status === 'opening'}
            handleOpenCase={handleOpenCase}
            selectedCase={selectedCase}
          />
        )}
      </div>
    </section>
  );
}



function CaseList(){
 return <div className="case-list">
      {cases.map((item)=>{
       return <div className="case-card" key = {item.id} >
        <div className="case-image" aria-hidden="true" />
        <div className="case-meta">
          <p className="case-name">{item.name}</p>
          <p className="case-price">${item.price}</p>
        </div>
        <Link className="btn btn-primary" to={`/case/${item.id}`}>Открыть</Link>
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
  const[inventoryControls,setInventoryControls] = useState({
    sortBy:'date',
    sortDirection:'desc',
    rarity:'all'
  });
  const[showSettings,setShowSettings] = useState(false);
  const toggleSettings = () => setShowSettings((prev)=>!prev);
  const settingsRef = useRef(null);

  useEffect(() => {
    console.log('SETUP', showSettings)
    if (!showSettings) {
      return;
    }

    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return (() => {document.removeEventListener('click', handleClickOutside);
      console.log('CLEAN')
    })
  }, [showSettings]);

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


const sellDroppedItem = (item) => {
  if (item == null){
    return;
  }

  setCoins((coins) => coins + item.price)
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

const keepItem = (item) => {
  if (item == null){
    return;
  }

  setInventory((previousInventory)=>{
    return [...previousInventory,item]
});
}

  return (

    <div className="app-shell">
      <div className="settings" ref={settingsRef}>
        <button className="btn btn-ghost settings-trigger" onClick={toggleSettings}>Настройки</button>
        {showSettings && (
          <div className="settings-panel">
            <div className="settings-panel__header">Настройки</div>
          </div>
        )}
      </div>

      <Routes>
        <Route path="/" element={
          <MainWindow nameProject={nameProject} coins={coins} />
        } />

        <Route path="/case/:caseId" element={
          <SelectedCaseWindow
            coins={coins}
            setCoins={setCoins}
            keepItem={keepItem}
            sellDroppedItem={sellDroppedItem}
          />
        } />

        <Route path="/profile" element={<ProfileWindow />} />

        <Route path="/inventory" element={
          <InventoryWindow
            visibleInventory={visibleInventory}
            sellItemOnInventory={sellItemOnInventory}
            inventoryControls={inventoryControls}
            setInventoryControls={setInventoryControls}
          />
        } />
      </Routes>
    </div>
  )
};

 export default App
