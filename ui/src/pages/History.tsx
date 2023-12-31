import {Component, createSignal, For, onMount, Show, Suspense} from "solid-js";
import {getBaseUrl, MODEL_OPTIONS} from "../constants";
import {fetchHelper} from "../util/fetchHelper";
import {HistoryDates, SavedHistory} from "../models";
import {Loading} from "../components/Loading";
import {NoData} from "../components/NoData";
import LoadingSelect from "../components/LoadingSelect";
import SavedGameCard from "../components/SavedGameCard";


export const getPredictedWinColor = (winPercentage: number) => {
    if (winPercentage > 50 && winPercentage < 60) return 'text-yellow-500';
    if (winPercentage >= 60) return 'text-green-500';
    if (winPercentage <= 50) return 'text-red-500';
};
const History: Component = () => {
    const [savedDates, setSavedDates] = createSignal<HistoryDates[]>([]);
    const [savedHistory, setSavedHistory] = createSignal<SavedHistory[]>([])
    const [loading, setLoading] = createSignal(true);
    const [error, setError] = createSignal(false);
    const [model, setModel] = createSignal('');
    const [currentDates, setCurrentDates] = createSignal<Date[]>([]);
    const [fetchingGamesOnDate, setFetchingGamesOnDate] = createSignal(false)
    const [date, setDate] = createSignal<Date | undefined>(undefined);

    onMount(async () => {
        let url = `${getBaseUrl()}/sports/history/dates`
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

        let body = await response.json();

        setSavedDates(body as HistoryDates[]);
        setError(false);
        setLoading(false);
    });


    const getGamesOnDate = async (modelName: string, date: Date) => {

        let year = date.getFullYear();
        // add a leading zero to the month
        let month = `0${date.getMonth() + 1}`.slice(-2);
        let day = ('0' + date.getDate()).slice(-2);
        let hour = ('0' + date.getHours()).slice(-2);


        let formattedDate = `${year}-${month}-${day}`;
        if (sessionStorage.getItem(`${modelName}-${formattedDate}-${hour}`)) {
            setSavedHistory(
                JSON.parse(
                    sessionStorage.getItem(`${modelName}-${formattedDate}-${hour}`) as string
                ) as SavedHistory[]
            )
            return;
        }

        setFetchingGamesOnDate(true)

        let url = `${getBaseUrl()}/sports/history?date=${formattedDate}&model_name=${modelName}`;
        let response = await fetchHelper(url)


        if (!response) {
            setError(true);
            setFetchingGamesOnDate(false);
            return;
        }

        if (!response.ok) {
            setError(true);
            setFetchingGamesOnDate(false);
            return;
        }


        let body = await response.json();
        sessionStorage.setItem(`${modelName}-${formattedDate}-${hour}`, JSON.stringify(body));
        setSavedHistory(body as SavedHistory[])
        setFetchingGamesOnDate(false)
    }


    const sortByWinner = () => {
        return savedHistory().sort((a, b) => {
            let _1 = a.game.winner == a.game.prediction;
            let _2 = a.game.winner == b.game.prediction;
            if (_1 && !_2) return -1;
            if (!_1 && _2) return 1;
            return 0;
        });
    };

    const getWinPercentage = (games: SavedHistory[]) => {
        let won = games.filter((game) => game.game.winner == game.game.prediction).length;
        return Math.round((won / games.length) * 100);
    };


    const getOptions = () => MODEL_OPTIONS.filter((option) => {
        return savedDates().some((date) => date.model_name.includes(option.key));
    });


    return (
        <Suspense fallback={<Loading/>}>
            <Show when={loading()} keyed>
                <Loading/>
            </Show>
            <Show when={error() && !loading()} keyed>
                <NoData message={'There was an error fetching the data'}/>
            </Show>
            <Show when={!loading() && savedDates().length === 0} keyed>
                <NoData message={'There are no games we have saved :('}/>
            </Show>
            <Show when={!loading() && savedDates().length !== 0} keyed>
                <div class="flex flex-col items-center">
                    <h1 class="text-base mb-4 mt-2 text-white font-bold text-center">Select a model you'd like to see
                        the history of</h1>
                    <LoadingSelect disabled={fetchingGamesOnDate()} options={getOptions()} onInput={async (e) => {
                        let modelName = e.target.value;
                        let oldModel = model();
                        setModel(modelName);

                        let date = savedDates().find((date) => date.model_name.includes(modelName));
                        if (!date) {
                            console.error('Could not find date for model name: ' + modelName);
                            return;
                        }
                        let datesForModel = date.dates
                            .map((date) => {
                                let [year, month, day] = date.split('-');
                                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                            }).sort((a, b) => a.getTime() - b.getTime());
                        setCurrentDates(datesForModel);

                        if (oldModel !== modelName) {
                            setDate(datesForModel[datesForModel.length - 1]);
                            await getGamesOnDate(modelName, datesForModel[datesForModel.length - 1]);
                        }
                    }}/>
                </div>
                <Show when={model() !== 'None' && model() !== ''} keyed>
                    <div class="flex flex-col items-center mb-4">
                        <a href={`/about/${model()}`} class="text-white hover:underline text-center mt-4">Learn more
                            about {model().toUpperCase()}</a>
                    </div>
                </Show>

                <Show when={currentDates().length !== 0} keyed>
                    <div class="flex flex-col items-center">
                        <input
                            id={'date-picker'}
                            class={"appearance-none mb-2 block bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"}
                            type="date"
                            value={currentDates()[currentDates().length - 1].toISOString().split('T')[0]}
                            min={currentDates()[0].toISOString().split('T')[0]}
                            max={currentDates()[currentDates().length - 1].toISOString().split('T')[0]}
                            onInput={async (e) => {
                                let modelDates = savedDates().find((date) => date.model_name.includes(model()));
                                if (!modelDates) {
                                    console.error('Could not find dates for model: ' + model());
                                    return;
                                }
                                let selectedDate = e.currentTarget.value;
                                if (new Date(selectedDate) > currentDates()[currentDates().length - 1]) {
                                    e.currentTarget.value = date()!.toISOString().split('T')[0];
                                    return;
                                }

                                if (new Date(selectedDate) < currentDates()[0]) {
                                    e.currentTarget.value = date()!.toISOString().split('T')[0];
                                    return;
                                }

                                let [year, month, day] = selectedDate.split('-');
                                let newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                setDate(newDate);

                                await getGamesOnDate(model(), newDate);
                            }}/>
                    </div>
                </Show>
                <Show when={!fetchingGamesOnDate()} fallback={<Loading/>} keyed>
                    <div class="flex flex-col items-center mt-15 justify-center w-full h-full">
                        <Show when={!isNaN(getWinPercentage(savedHistory())) && model() !== 'ou'} keyed>
                            <h5 class="text-base text-white font-bold text-center">
                                We predicted
                                <span class={`${getPredictedWinColor(getWinPercentage(savedHistory())
                                )}`}> {getWinPercentage(savedHistory())}% </span>
                                of the games correctly on <span
                                class="font-bold underline">{date()?.toDateString()}</span>
                            </h5>
                        </Show>
                    </div>
                    <For each={sortByWinner()}>{(game) => <SavedGameCard savedHistory={game}/>}</For>
                </Show>
                <Show when={savedHistory().length == 0 && currentDates().length !== 0} keyed>
                    <NoData message={'There are no games we have saved for this date :('}/>
                </Show>

            </Show>
        </Suspense>
    )
}

export default History;