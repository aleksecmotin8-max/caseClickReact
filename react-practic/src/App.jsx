import './App.css'
import {useState} from 'react';

const items = [
  {
    id: 1,
    name: 'P250 | Sand Dune',
    rarity: 'common',
    price: 2,
    weight: 1200,
  },
  {
    id: 2,
    name: 'MP9 | Goo',
    rarity: 'common',
    price: 4,
    weight: 900,
  },
  {
    id: 3,
    name: 'USP-S | Cortex',
    rarity: 'rare',
    price: 12,
    weight: 350,
  },
  {
    id: 4,
    name: 'AK-47 | Redline',
    rarity: 'rare',
    price: 28,
    weight: 180,
  },
  {
    id: 5,
    name: 'M4A1-S | Player Two',
    rarity: 'epic',
    price: 65,
    weight: 70,
  },
  {
    id: 6,
    name: 'AWP | Asiimov',
    rarity: 'epic',
    price: 110,
    weight: 35,
  },
  {
    id: 7,
    name: 'Glock-18 | Fade',
    rarity: 'legendary',
    price: 350,
    weight: 8,
  },
  {
    id: 8,
    name: 'Karambit | Doppler',
    rarity: 'legendary',
    price: 900,
    weight: 2,
  },
];

const cases = [
  {
    id: 1,
    name: 'Street Case',
    price: 5,
    itemIds: [1, 2, 3, 4],
  },
  {
    id: 2,
    name: 'Classified Case',
    price: 25,
    itemIds: [3, 4, 5, 6],
  },
  {
    id: 3,
    name: 'High Roller Case',
    price: 100,
    itemIds: [4, 5, 6, 7, 8],
  },
];

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

  

return <div>{ isOpening ? <p>Loading...</p>
   : <> <p>{selectedCase.name}</p>
    <button onClick = {openCase}>open Case</button></>}
</div>
}

function Message({message}){

  if(!message){
    return null;
  }

  return <p>{message}</p>

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

  const[isOpening,setIsOpening] = useState (false);
  const[message,setMessage] = useState('');
  const[coins,setCoins] = useState(1000);
  const[inventory,setInventory] = useState([]);
  const [selectedCaseId,setSelectedCaseId] = useState(null);

  const handleAddCoin = () => {
    setCoins(previousCoins => previousCoins + 1)
  }

 const selectCase = (caseId)=>{
    setSelectedCaseId(caseId)
  }


let selectedCase = cases.find((item)=>{
    return item.id === selectedCaseId
  })

  const openCase = async ()  => {

      

       
    if(coins < selectedCase.price)
      {

         setMessage('Not enough coins') 
        return
    }
     
    setIsOpening(true)
     setCoins(previousCoins => previousCoins - selectedCase.price);

   try {
          await delay(2000);
   let caseItems = items.filter((item)=>{
          return selectedCase.itemIds.includes(item.id)
    })

    let randomItem = getRandomItemByWeight(caseItems)

      const newItem = {
        ...randomItem,
        dropId:crypto.randomUUID()
      }
     
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
      <Message  message = {message}/>
     { selectedCaseId === null ?<CaseList selectCase ={selectCase}/>
    :<> <BackCaseList setSelectedCaseId={setSelectedCaseId}/>
       <CaseOpening openCase = {openCase} selectedCase={selectedCase}  isOpening = {isOpening}/>
   </>
     }
  <Inventory  inventory = {inventory} /> 
  </div>

};  

 
 export default App
