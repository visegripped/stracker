import { useParams } from 'react-router-dom';

const Symbol = () => {
  let { id } = useParams()
  return (
    <div>
      <h2>Symbol Content {id}</h2>
    </div>
  )

}

export default Symbol