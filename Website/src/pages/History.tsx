import {Component, createSignal, For, onMount, Show, Suspense} from "solid-js";
import {fetchHelper} from "../util/fetchHelper";
import {Loading} from "../components/Loading";
import {NoData} from "../components/NoData";
import {DateTimePicker} from 'date-time-picker-solid'
import {SavedGame} from "../models";
import SavedGameCard from "../components/SavedGameCard";

const History: Component = () => {
    const [error, setError] = createSignal(false);
    const [loading, setLoading] = createSignal(true);
    const [historyLoading, setHistoryLoading] = createSignal(false);
    const [dates, setDates] = createSignal([] as Date[]);
    const [history, setHistory] = createSignal([] as SavedGame[]);
    const [date, setDate] = createSignal(undefined as Date | undefined);


    const getBaseUrl = (useRemote?: boolean) => {
        // check if current url is localhost
        const remoteUrl = 'https://api.accuribet.win';
        if (useRemote) return remoteUrl;
        return window.location.href.includes('localhost') ? 'http://localhost:8080' : remoteUrl;
    };


    onMount(async () => {
        let url = `${getBaseUrl()}/sports/history/dates`;
        let response = await fetchHelper(url);

        if (!response) {
            setError(true);
            setLoading(false);
            return;
        }

        if (!response.ok) {
            setError(true);
            setLoading(false);
            return;
        }

        let dates = await response.json() as string[];

        let parsedDates = dates.map((date) => {
            let [year, month, day] = date.split('-');
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }).sort((a, b) => a.getTime() - b.getTime());


        setDates(parsedDates);
        setDate(parsedDates.length == 0 ? undefined : parsedDates[0]);
        setLoading(false);
    })


    const yesterdayDate = (d: Date) => {
        const h = new Date(d);
        h.setDate(h.getDate() - 1);
        return h;
    }

    const tomorrowDate = (d: Date) => {
        const h = new Date(d);
        h.setDate(h.getDate() + 1);
        return h;
    }

    const getGamesOnDate = async (date?: Date) => {
        if (!date) return;

        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        let formattedDate = `${year}-${month}-${day}`;
        if (localStorage.getItem(formattedDate)) {
            let games = JSON.parse(localStorage.getItem(formattedDate) as string) as SavedGame[];
            setHistory(games);
            return;
        }

        setHistoryLoading(true);
        let url = `${getBaseUrl()}/sports/history?date=${formattedDate}`;
        let response = await fetchHelper(url);

        if (!response) {
            setError(true);
            setHistoryLoading(false);
            return;
        }

        if (!response.ok) {
            setError(true);
            setHistoryLoading(false);
            return;
        }
        const games = await response.json() as SavedGame[];
        localStorage.setItem(formattedDate, JSON.stringify(games));
        setHistory(games);
        setHistoryLoading(false)
    }


    const sortByWinner = (games: SavedGame[]) => {
        return games.sort((a, b) => {
            let _1 = a.winner == a.our_projected_winner;
            let _2 = b.winner == b.our_projected_winner;
            if (_1 && !_2) return -1;
            if (!_1 && _2) return 1;
            return 0;
        });
    }

    const getWinPercentage = (games: SavedGame[]) => {
        let won = games.filter((game) => game.winner == game.our_projected_winner).length;
        return Math.round(won / games.length * 100);
    }


    return (
        <Suspense fallback={<Loading/>}>
            <Show when={loading()} keyed>
                <Loading/>
            </Show>
            <Show when={error() && !loading()} keyed>
                <NoData message={'There was an error fetching the data'}/>
            </Show>
            <Show when={!loading() && dates().length === 0} keyed>
                <NoData message={'There are no games we have saved :('}/>
            </Show>
            <Show when={!loading() && dates().length !== 0} keyed>
                <div class="flex flex-col items-center mt-15 justify-center w-full h-full">
                    <h5 class="text-xl text-white font-bold text-center">Choose a date to see our history on</h5>
                    <DateTimePicker
                        minDate={yesterdayDate(dates()[0])}
                        maxDate={tomorrowDate(dates()[dates().length - 1])}
                        dateFormat={'Y-M-D'}
                        currentDate={date()!}
                        calendarResponse={async (props) => {
                            props.setCalendarState(false)
                            if (date()?.toDateString() == props.currentDate?.toDateString()) return;
                            setDate(props.currentDate)
                            props.currentDate = date();
                            await getGamesOnDate(props.currentDate)
                        }}/>
                </div>

                <Show when={!historyLoading()} fallback={<Loading/>} keyed>
                    <div class="flex flex-col items-center mt-15 justify-center w-full h-full">
                        <Show when={!isNaN(getWinPercentage(history()))} keyed>
                            <h5 class="text-xl text-white font-bold text-center">We predicted
                                <span class={`text-${getWinPercentage(history()) < 50 ? 'red' : getWinPercentage(history()) < 60 ? 'amber' : 'green'}-500`}> {getWinPercentage(history())}% </span>
                                of the games correctly on <span class="font-bold underline">{date()?.toDateString()}</span>
                            </h5>
                        </Show>
                    </div>
                    <For each={sortByWinner(history())}>{(game) => (<SavedGameCard game={game}/>)}</For>
                </Show>
            </Show>
        </Suspense>
    );
}

export default History;