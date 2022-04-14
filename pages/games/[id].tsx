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

const checkWinner = (game: [IRow, IRow, IRow]): boolean => {
  const checkRow0 =
    game[0][0] !== "" && game[0][0] === game[0][1] && game[0][1] === game[0][2];
  const checkRow1 =
    game[1][0] !== "" && game[1][0] === game[1][1] && game[1][1] === game[1][2];
  const checkRow2 =
    game[2][0] !== "" && game[2][0] === game[2][1] && game[2][1] === game[2][2];

  const checkCol0 =
    game[0][0] !== "" && game[0][0] === game[1][0] && game[1][0] === game[2][0];
  const checkCol1 =
    game[0][1] !== "" && game[0][1] === game[1][1] && game[1][1] === game[2][1];
  const checkCol2 =
    game[0][2] !== "" && game[0][2] === game[1][2] && game[1][2] === game[2][2];

  const checkCross1 =
    game[0][0] !== "" && game[0][0] === game[1][1] && game[1][1] === game[2][2];
  const checkCross2 =
    game[0][2] !== "" && game[0][2] === game[1][1] && game[1][1] === game[2][0];

  return (
    checkRow0 ||
    checkRow1 ||
    checkRow2 ||
    checkCol0 ||
    checkCol1 ||
    checkCol2 ||
    checkCross1 ||
    checkCross2
  );
};

export default function Game(id: IProps) {
  const [game, setGame] = useState<IGame | null>(null);
  const winner = !!game && checkWinner(game.board);
  const [blockUserMove, setBlockUserMove] = useState(true);

  useEffect(() => {
    const ref = database.ref(`games/${id.id}`);
    ref.on("value", (snapshot) => {
      //.on() -> listening for changes
      setGame(snapshot.val());
      setBlockUserMove(false);
    });

    return () => ref.off(); //.off() => stop listening for changes
  }, [id]);

  useEffect(() => {
    console.log(`user can play: ${blockUserMove}`);
  }, [blockUserMove]);

  const saveMove = (rowIndex: number, colIndex: number) => {
    if (!game) return;
    const gameCopy = { ...game };
    gameCopy.board[rowIndex][colIndex] = game.turn === game.first ? "X" : "O";
    gameCopy.turn = gameCopy.turn === "player1" ? "player2" : "player1";
    database.ref(`games/${id.id}`).set(gameCopy);

    setBlockUserMove(true);
  };

  if (!game) {
    return <div>Loading...</div>;
  }
  return (
    <main>
      {winner ? (
        <h1>
          Winner's {game.turn === "player1" ? game.player2 : game.player1}
        </h1>
      ) : (
        <h1>{game.turn === "player1" ? game.player1 : game.player2}'s Turn</h1>
      )}
      <div className="board">
        {game.board.map((row, rowIndex) => {
          return (
            <div className="row" key={`row-${rowIndex}`}>
              {row.map((col, colIndex) => {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="square"
                    onClick={() => {
                      if (col === "" && !winner && !blockUserMove) {
                        saveMove(rowIndex, colIndex);
                      }
                    }}
                  >
                    {col}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <button
        onClick={() => {
          const gameCopy = { ...game };
          gameCopy.board = [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""],
          ];
          gameCopy.first = gameCopy.first === "player1" ? "player2" : "player1";
          gameCopy.turn = gameCopy.first;
          database.ref(`games/${id.id}`).set(gameCopy);
        }}
      >
        Reset
      </button>
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
