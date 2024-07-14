import { useParams } from 'react-router-dom';

const Symbol = () => {
  let { symbol } = useParams()
  return (
    <div>
      
      <h2>Symbol Content {symbol}</h2>
    </div>
  )

}

export default Symbol