

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import apiPost from "../utilities/apiPost";




const PageContent = (props) => {
  const {tokenId} = props;
  return (
    <section className='grid-container grid-columns'>
    <div>
      Your tracked symbols:
    </div>
      <div>
        Your recent sell signals:
      </div>
      <div>
        Your recent buy signals:
      </div>

      <div>
        Most recent signals:
      </div>
    </section>

  );
}



const Home = () => {
  const [Auth] = useContext(AuthContext);
  const { tokenId } = Auth;

  return (
    <>
      {tokenId ? (
        <PageContent tokenId={tokenId} />
      ) : (
        <h3>Please log in</h3>
      )}
    </>
  );

}

export default Home