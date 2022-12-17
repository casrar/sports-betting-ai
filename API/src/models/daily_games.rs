use polars::prelude::DataFrame;
use serde_derive::Deserialize;
use serde_derive::Serialize;
use serde_json::Value;
use crate::util::string::remove_quotes;






#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyGames {
    pub meta: Meta,
    pub scoreboard: Scoreboard,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Meta {
    pub version: i64,
    pub request: String,
    pub time: String,
    pub code: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Scoreboard {
    pub game_date: String,
    pub league_id: String,
    pub league_name: String,
    pub games: Vec<Game>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Game {
    pub game_id: String,
    pub game_code: String,
    pub game_status: i64,
    pub game_status_text: String,
    pub period: i64,
    pub game_clock: String,
    #[serde(rename = "gameTimeUTC")]
    pub game_time_utc: String,
    pub game_et: String,
    pub regulation_periods: i64,
    pub if_necessary: bool,
    pub series_game_number: String,
    pub series_text: String,
    pub home_team: HomeTeam,
    pub away_team: AwayTeam,
    pub game_leaders: GameLeaders,
    pub pb_odds: PbOdds,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HomeTeam {
    pub team_id: i64,
    pub team_name: String,
    pub team_city: String,
    pub team_tricode: String,
    pub wins: i64,
    pub losses: i64,
    pub score: i64,
    pub seed: Value,
    pub in_bonus: Value,
    pub timeouts_remaining: i64,
    pub periods: Vec<Period>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Period {
    pub period: i64,
    pub period_type: String,
    pub score: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AwayTeam {
    pub team_id: i64,
    pub team_name: String,
    pub team_city: String,
    pub team_tricode: String,
    pub wins: i64,
    pub losses: i64,
    pub score: i64,
    pub seed: Value,
    pub in_bonus: Value,
    pub timeouts_remaining: i64,
    pub periods: Vec<Period2>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Period2 {
    pub period: i64,
    pub period_type: String,
    pub score: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameLeaders {
    pub home_leaders: HomeLeaders,
    pub away_leaders: AwayLeaders,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HomeLeaders {
    pub person_id: i64,
    pub name: String,
    pub jersey_num: String,
    pub position: String,
    pub team_tricode: String,
    pub player_slug: Value,
    pub points: i64,
    pub rebounds: i64,
    pub assists: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AwayLeaders {
    pub person_id: i64,
    pub name: String,
    pub jersey_num: String,
    pub position: String,
    pub team_tricode: String,
    pub player_slug: Value,
    pub points: i64,
    pub rebounds: i64,
    pub assists: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PbOdds {
    pub team: Value,
    pub odds: f64,
    pub suspended: i64,
}


pub struct Match {
    pub game_id: String,
    pub home_team_id: i64,
    pub home_team_name: String,
    pub away_team_id : i64,
    pub away_team_name: String
}

impl Match {
    pub fn from_game(game: Game) -> Self {
        Match {
            game_id: game.game_id,
            home_team_id: game.home_team.team_id,
            away_team_id: game.away_team.team_id,
            home_team_name: format!("{} {}", &game.home_team.team_city, &game.home_team.team_name),
            away_team_name: format!("{} {}", &game.away_team.team_city, &game.away_team.team_name)
        }
    }
}
