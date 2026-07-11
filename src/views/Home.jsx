import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import apiPost from "@utilities/apiPost";
import PathConstants from "@routes/pathConstants";
import { ProfileContext } from "@context/ProfileContext";

const PageContent = (props) => {
  const { profile: userProfile } = useContext(ProfileContext);
  const [usersTrackedSymbols, setUsersTrackedSymbols] = useState([]);
  const [recentSignals, setRecentSignals] = useState([]);
  const [recent20Signals, setRecent20Signals] = useState([]);
  const [recentTrackedBuySignals, setRecentTrackedBuySignals] = useState([]);
  const [recentTrackedSellSignals, setRecentTrackedSellSignals] = useState([]);

  const { emailAddress } = userProfile;

  const getLast20 = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    const arr = [];
    const max = data.length < 20 ? data.length : 20;
    for (let i = 0; i < max; i++) {
      arr.push(data[i]);
    }
    return arr;
  };

  const flattenObjectBySymbol = (data) => {
    if (!Array.isArray(data)) {
      return [];
    }
    const arr = [];
    const max = data.length;
    for (let i = 0; i < max; i++) {
      if (data[i] && data[i].symbol) {
        arr.push(data[i].symbol);
      }
    }
    return arr;
  };

  const haveCommonItems = (trackedItems, recentAlerts) => {
    const alertSet = new Set(trackedItems);
    const commonItems = recentAlerts.filter((item) => alertSet.has(item));
    return commonItems;
  };

  const getTrackedAlertsBySignalType = (
    type = "sell",
    alertHistory = [],
    trackedSymbols = []
  ) => {
    const filteredList = [];
    alertHistory.forEach((data) => {
      if (trackedSymbols.includes(data.symbol) && data.type.includes(type)) {
        filteredList.push(data);
      }
    });
    return filteredList;
  };

  //recentSignals does not require emailAddress so handle it separately.
  useEffect(() => {
    if (recentSignals.length === 0) {
      const alertHistoryResponse = apiPost({
        task: "getAlertHistory",
        limit: 300,
      });
      alertHistoryResponse &&
        alertHistoryResponse.then((data) => {
          const dataArray = Array.isArray(data) ? data : [];
          setRecent20Signals(getLast20(dataArray));
          setRecentSignals(dataArray);
        }).catch((error) => {
          console.error("Error fetching alert history:", error);
        });
    }
  }, [recentSignals.length]);

  useEffect(() => {
    if (emailAddress) {
      const symbolListResponse = apiPost({
        task: "getTrackedSymbolList",
        userId: emailAddress,
      });
      symbolListResponse &&
        symbolListResponse.then((data) => {
          setUsersTrackedSymbols(Array.isArray(data) ? data : []);
        }).catch((error) => {
          console.error("Error fetching tracked symbols:", error);
          setUsersTrackedSymbols([]);
        });
    }
  }, [emailAddress]);

  useEffect(() => {
    // console.log(` -> useEffect the two middle columns was triggered. if emailAddress is empty it will not request.  emailAddress: ${emailAddress}
    //   usersTrackedSymbols.length: ${usersTrackedSymbols.length}
    //   recentSignals.length: ${recentSignals.length}
    //   recentTrackedBuySignals.length: ${recentTrackedBuySignals.length}
    //   recentTrackedSellSignals.length: ${recentTrackedSellSignals.length}
    //   `)
    if (
      usersTrackedSymbols.length &&
      recentSignals.length &&
      recentTrackedBuySignals.length === 0 &&
      recentTrackedSellSignals.length === 0 &&
      emailAddress
    ) {
      const recentSignalBySymbol = flattenObjectBySymbol(recentSignals);
      const trackedSignalBySymbol = flattenObjectBySymbol(usersTrackedSymbols);
      const trackedSymbolsWithRecentAlerts = haveCommonItems(
        trackedSignalBySymbol,
        recentSignalBySymbol
      );
      const recentTrackedBuySignals = getTrackedAlertsBySignalType(
        "buy",
        recentSignals,
        trackedSymbolsWithRecentAlerts
      );
      const recentTrackedSellSignals = getTrackedAlertsBySignalType(
        "sell",
        recentSignals,
        trackedSymbolsWithRecentAlerts
      );
      setRecentTrackedBuySignals(recentTrackedBuySignals);
      setRecentTrackedSellSignals(recentTrackedSellSignals);
    }
  }, [usersTrackedSymbols, recentSignals, emailAddress]);

  return (
    <section className="grid-container grid-columns">
      <div>
        <h2>Your tracked symbols:</h2>
        {Array.isArray(usersTrackedSymbols) && usersTrackedSymbols.map((data, index) => {
          return (
            <div key={`your-tracked-${data?.symbol || index}-${data?.type || ''}-${data?.date || ''}`}>
              <Link to={`${PathConstants.SYMBOL}/${data?.symbol || ''}`}>
                {data?.name || data?.symbol || 'Unknown'}
              </Link>
            </div>
          );
        })}
      </div>
      <div>
        <h2>Your recent buy signals:</h2>
        {Array.isArray(recentTrackedBuySignals) && recentTrackedBuySignals.map((data, index) => {
          return (
            <div
              key={`your-recent-buy-${data?.symbol || index}-${data?.type || ''}-${data?.date || ''}-${index}`}
            >
              <Link to={`${PathConstants.SYMBOL}/${data?.symbol || ''}`}>
                {data?.name || data?.symbol || 'Unknown'}
              </Link>
              : {data?.type || 'N/A'} on {data?.date || 'N/A'}
            </div>
          );
        })}
      </div>
      <div>
        <h2>Your recent sell signals:</h2>
        {Array.isArray(recentTrackedSellSignals) && recentTrackedSellSignals.map((data, index) => {
          return (
            <div
              key={`your-recent-sell-${data?.symbol || index}-${data?.type || ''}-${data?.date || ''}-${index}`}
            >
              <Link to={`${PathConstants.SYMBOL}/${data?.symbol || ''}`}>
                {data?.name || data?.symbol || 'Unknown'}
              </Link>
              : {data?.type || 'N/A'} on {data?.date || 'N/A'}
            </div>
          );
        })}
      </div>

      <div>
        <h2>Most recent signals:</h2>
        {Array.isArray(recent20Signals) && recent20Signals.map((data, index) => {
          return (
            <div key={`most-recent-${data?.symbol || index}-${index}`}>
              <Link to={`${PathConstants.SYMBOL}/${data?.symbol || ''}`}>
                {data?.name || data?.symbol || 'Unknown'}
              </Link>
              : {data?.type || 'N/A'} on {data?.date || 'N/A'}
            </div>
          );
        })}
      </div>
    </section>
  );
};

const Home = () => {
  return <PageContent />;
};

export default Home;
