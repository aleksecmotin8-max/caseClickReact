import './App.css'

function App(){
  const notes = [
    {
     id: 1,
     title:'first note',
     text:'this is text first note'
    }, {
      id: 2,
      title: 'Вторая заметка',
      text: 'Это текст второй заметки',
    }
  ]
  return(
  <div>
    <h1>Notes App</h1>
   <div>
    {notes.map((note)=>(
        <div key = {note.id}>
          <h2>{note.title}</h2>
          <p>{note.text}</p>
          </div>
          )
        )}
   </div>
  </div>)
}

export default App