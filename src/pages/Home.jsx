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
  const [userId, setUserId] = useState(emailAddress || '');

  const getLast20 = (data) => {
    const arr = [];
    const max = data.length < 20 ? data.length : 20;
    for (let i = 0; i <= max; i++) {
      arr.push(data[i]);
    }
    return arr;
  };

  const flattenObjectBySymbol = (data) => {
    const arr = [];
    const max = data.length;
    for (let i = 0; i < max; i++) {
      arr.push(data[i].symbol);
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


  //recentSignals does not require userId so handle it separately.
  useEffect(() => {
    if(recentSignals.length === 0){
      const alertHistoryResponse = apiPost({
        task: "getAlertHistory",
        limit: 300,
      });
      alertHistoryResponse &&
        alertHistoryResponse.then((data) => {
          setRecent20Signals(getLast20(data));
          setRecentSignals(data);
        });
    }
  }, []);

  useEffect(() => {
    const symbolListResponse = apiPost({
      task: "getTrackedSymbolList",
      userId,
    });
    symbolListResponse &&
      symbolListResponse.then((data) => {
        setUsersTrackedSymbols(data);
      });
  }, []);


  useEffect(() => {
    if (
      usersTrackedSymbols.length &&
      recentSignals.length &&
      recentTrackedBuySignals.length === 0 &&
      recentTrackedSellSignals.length === 0 &&
      userId
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
  }, [usersTrackedSymbols, recentSignals, userId]);

  return (
    <section className="grid-container grid-columns">
      <div>
        <h2>Your tracked symbols:</h2>
        {usersTrackedSymbols.map((data) => {
          return (
            <div key={`your-tracked-${data.symbol}-${data.type}-${data.date}`}>
              <Link to={`${PathConstants.SYMBOL}/${data.symbol}`}>
                {data.name}
              </Link>
            </div>
          );
        })}
      </div>
      <div>
        <h2>Your recent buy signals:</h2>
        {recentTrackedBuySignals.map((data, index) => {
          return (
            <div
              key={`your-recent-${data.symbol}-${data.type}-${
                data.date
              }-${Math.random()}`}
            >
              <Link to={`${PathConstants.SYMBOL}/${data.symbol}`}>
                {data.name}
              </Link>
              : {data.type} on {data.date}
            </div>
          );
        })}
      </div>
      <div>
        <h2>Your recent sell signals:</h2>
        {recentTrackedSellSignals.map((data, index) => {
          return (
            <div
              key={`your-recent-${data.symbol}-${data.type}-${
                data.date
              }-${Math.random()}`}
            >
              <Link to={`${PathConstants.SYMBOL}/${data.symbol}`}>
                {data.name}
              </Link>
              : {data.type} on {data.date}
            </div>
          );
        })}
      </div>

      <div>
        <h2>Most recent signals:</h2>
        {recent20Signals.map((data, index) => {
          return (
            <div key={`most-recent-${data.symbol}`}>
              <Link to={`${PathConstants.SYMBOL}/${data.symbol}`}>
                {data.name}
              </Link>
              : {data.type} on {data.date}
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
