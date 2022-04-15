import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { firebase } from "../src/initFirebase";

const database = firebase.database();

const Home: NextPage = () => {
  const [player1, setPlayer1] = useState("Player1");
  const [player2, setPlayer2] = useState("Player2");
  const router = useRouter();
  return (
    <div>
      <main>
        <h4>Welcome to the Tic-Tac-Toe game!</h4>
        <p>Create a game and share the URL with your buddy.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const gamesRef = database.ref("games"); //will create new 'game' db, if there is nothing in it. if there is a 'games' table, it will just get its ref
            const newGameRef = gamesRef.push(); //will push new game to the 'games' table
            newGameRef.set({
              player1,
              player2,
              turn: "player1",
              first: "player1",
              board: [
                ["", "", ""],
                ["", "", ""],
                ["", "", ""],
              ],
            });

            router.push(`/games/${newGameRef.key}`); //navigating to a page with a url of the new games id (key)
          }}
        >
          <input
            type="text"
            name="player1"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
          />
          <input
            type="text"
            name="player2"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
          />
          <button type="submit">Let's play!</button>
        </form>
      </main>{" "}
    </div>
  );
};

export default Home;
