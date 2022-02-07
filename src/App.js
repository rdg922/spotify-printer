import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

/* https://accounts.spotify.com/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&scope=user-read-private%20user-read-email&state=34fFs29kd09 */
const CLIENT_ID = "CLIENT_ID_HERE";
const SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
const REDIRECT_URL_AFTER_LOGIN = "https://rdg922.github.io/spotify-printer/build/index.html";

const SCOPES = ["ugc-image-upload", "user-read-recently-played", "user-read-playback-state", "user-top-read", "playlist-modify-public", "user-modify-playback-state", "playlist-modify-private", "user-follow-modify", "user-read-currently-playing", "user-follow-read", "user-library-modify", "user-read-playback-position", "playlist-read-private", "user-read-email", "user-read-private", "user-library-read", "playlist-read-collaborative"];
const SCOPES_URL_PARAM = SCOPES.join("%20");

const TOP_ENDPOINT = "	https://api.spotify.com/v1/me/top/tracks"

const getReturnParamsFromSpotifyAuth = (hash) => {
  const stringAfterHashtag = hash.substring(1);
  const paramsInUrl = stringAfterHashtag.split("&");
  const paramsSplitUp = paramsInUrl.reduce((accumulator, currentValue) => {
    const [key, value] = currentValue.split("=");
    accumulator[key] = value;
    return accumulator;
  }, {})
  return paramsSplitUp;
}

function App() {
  const [token, setToken] = useState('');
  const [data, setData] = useState('');

  useEffect(() => {
    if (window.location.hash) {
      const {
        access_token,
        expires_in,
        token_type
      } = getReturnParamsFromSpotifyAuth(window.location.hash);


      localStorage.clear();
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("tokenType", token_type);
      localStorage.setItem("expiresIn", expires_in);
    }

    if (localStorage.getItem('accessToken')) {
      setToken(localStorage.getItem("accessToken"));
    }

  })
  const handleLogin = () => {
    window.location = `${SPOTIFY_AUTHORIZE_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL_AFTER_LOGIN}&scope=${SCOPES_URL_PARAM}&response_type=token&show_dialog=true`
  }
  const getTop = () => {

    axios.get(TOP_ENDPOINT + "?time_range=short_term&limit=20&offset=1", {
      headers: {
        Authorization: "Bearer " + token
      }
    }).then(response => {

      let newData = [];
      for(let track of response.data.items){
        const url = track.album.images[1].url
        if (newData.indexOf(url) == -1) {
          newData.push(url);
        }
      }
      setData(newData.slice(0, 10))
    }).catch(error => console.log(error));
    
  }
  const renderPage = () => {
    if (!data) {
      return (
      <>
        <button onClick={getTop}>Get Top</button>
        <button onClick={handleLogin}>Auth</button>
      </>)
    } else {
      return data.map((url) => (
          // <img src={track.album.images[0].url}></img>
          // {console.log(track.album.images[0].url)}
          // console.log(track.album.images[0].url)
          <>
            <img src={url}>
            </img>
          </>
      ))
    }
  }
  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;
