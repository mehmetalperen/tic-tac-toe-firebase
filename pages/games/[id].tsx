import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { firebase } from "../../src/initFirebase";

const database = firebase.database();

interface IProps {
  id: string;
}

type IRow = [string, string, string];
interface IGame {
  player1: string;
  player2: string;
  first: string;
  turn: string;
  board: [IRow, IRow, IRow];
}

export default function Game(id: IProps) {
  const [game, setGame] = useState<IGame | null>(null);

  useEffect(() => {
    console.log(id.id);
    const ref = database.ref(`games/${id.id}`);
    ref.on("value", (snapshot) => {
      //.on() -> listening for changes
      setGame(snapshot.val());
    });

    return () => ref.off(); //.off() => stop listening for changes
  }, [id]);

  if (!game) {
    return <div>Loading...</div>;
  }
  return (
    <main>
      <h1>{game.turn === "player1" ? game.player1 : game.player2}'s Turn</h1>
      <div className="board">
        {game.board.map((row, rowIndex) => {
          return (
            <div className="row" key={`row-${rowIndex}`}>
              {row.map((col, colIndex) => {
                return (
                  <div key={`${rowIndex}-${colIndex}`} className="square"></div>
                );
              })}
            </div>
          );
        })}
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return { props: { id: query.id } };
};

/*
WHAT is this export const getServerSideProps: GetServerSideProps thing? and WHY are we using it?
it is used for getting the query id which has the id for the current game. 
the other way of getting it would be inside the Game function but it is little problematic. 
the page would be rendered before getting the id from the query and then rerender the page after gettign the id from the url. 
we don't want that. we want to get the id before rendering the page. with this serversideprops and async function we are able to do that. 
 */
