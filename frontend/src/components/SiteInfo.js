import React, { Component } from 'react';

class SiteInfo extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);

        this.state = {open: false};
    }

    toggle() {
        this.setState(({open}) => ({open: !open}));
    }

    render() {
        return (
            <React.Fragment>
                <button id="info" onClick={this.toggle}>What is this?</button>
                {this.state.open ? (
                    <div className="site-info">
                        <p>
                            You know how it is - it's game night, and you're sick of the traditional first game
                            of the evening: the "what game are we going to play?" game.
                        </p>
                        <p>
                            This site aims to speed up the process. Provided all games you have available to you
                            are stored in one or more of your players' collections
                            on <a href="https://boardgamegeek.com/" target="_blank" rel="noopener noreferrer">BoardGameGeek</a>,
                            you can import those collections just by entering the BGG username(s). Then all
                            you need to do is specify how many players you have, and how long you want the
                            game to take, and the site will show you exactly which games you have available
                            that meet those needs.
                        </p>
                        <p>
                            You'll probably still argue about what to play - but at least you'll be able to see
                            all the options at a glance. There are also easy-to-use ways to reorder the list of
                            games, and to filter them by various categories supplied by BGG - I hope these
                            features may prove useful. 
                        </p>
                        <p>
                            Note that all data is simply that provided by BoardGameGeek - you can't expect me to
                            manually provide data for tens of thousands of games and know how long a playtime they
                            might all have! So please don't complain to me that
                            7-player <a href="https://boardgamegeek.com/boardgame/102794/caverna-cave-farmers" target="_blank" rel="noopener noreferrer">Caverna</a> can't
                            possibly be played in an hour or less, or that it only
                            suggests <a href="https://boardgamegeek.com/boardgame/98778/hanabi" target="_blank" rel="noopener noreferrer">Hanabi</a> if
                            you put exactly 25 minutes in. Complain to BGG, and see if it does you any good
                            (unlikely) - it's nothing I can do anything about. (Although I certainly sympathise!)
                        </p>
                        <p>
                            Made by Robin Zigmond, developer and boardgamer, please feel free to check out my profiles
                            on <a href="https://boardgamegeek.com/user/robinz" target="_blank" rel="noopener noreferrer">BGG</a> and <a href="https://github.com/robinzigmond" target="_blank" rel="noopener noreferrer">Github</a>.
                            If you find this useful, please spread the word, and don't be afraid to make
                            suggestions (eg by private message on BGG) as to how to improve the site.
                        </p>
                        <button id="info-close" onClick={this.toggle}>Close</button>
                    </div>
                ) : null}
            </React.Fragment>
        );
    }
}

export default SiteInfo;