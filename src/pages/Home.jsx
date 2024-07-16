import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import apiPost from "../utilities/apiPost";
import { Link } from "react-router-dom";
import PathConstants from "../routes/pathConstants";

const PageContent = (props) => {
  const { tokenId } = props;
  const [usersTrackedSymbols, setUsersTrackedSymbols] = useState([]);
  const [Auth] = useContext(AuthContext);
  const { userId } = Auth;

  useEffect(() => {
    if (tokenId && userId) {
      const response = apiPost({
        task: "getTrackedSymbolList",
        tokenId,
        userId,
      });
      response &&
        response.then((data) => {
          setUsersTrackedSymbols(data);
        });
    }
  }, [tokenId]);

  return (
    <section className="grid-container grid-columns">
      <div>
        <h2>Your tracked symbols:</h2>
        {console.log(" -> usersTrackedSymbols: ", usersTrackedSymbols)}
        {usersTrackedSymbols.map((data) => {
          return (
            <div key={data.symbol}>
              <Link to={`${PathConstants.SYMBOL}/${data.symbol}`}>{data.name}</Link>
            </div>
          );
        })}
      </div>
      <div>Your recent sell signals:</div>
      <div>Your recent buy signals:</div>

      <div>Most recent signals:</div>
    </section>
  );
};

const Home = () => {
  const [Auth] = useContext(AuthContext);
  const { tokenId } = Auth;

  return (
    <>{tokenId ? <PageContent tokenId={tokenId} /> : <h3>Please log in</h3>}</>
  );
};

export default Home;
