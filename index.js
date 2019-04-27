const Fighter = {
    computed: {
        nameClasses: function () {
            return {
                condensed: true,
                "dark-blue": true,
                pointer: true,
                "strike-through": !this.fighter.selected,
                "text-center": true,
                uppercase: true
            };
        },
        wrapperClasses: function () {
            return {
                grayscale: !this.fighter.selected || (!this.fighter.losses && !this.fighter.wins),
            };
        }
    },
    props: {
        fighter: Object,
    },
    template: '#fighter-template',
    watch: {
        'fighter.losses': function (value) {
            localStorage.setItem(this.fighter.number + '.losses', this.fighter.losses);
        },
        'fighter.selected': function (value) {
            localStorage.setItem(this.fighter.number + '.selected', this.fighter.selected);
        },
        'fighter.wins': function (value) {
            localStorage.setItem(this.fighter.number + '.wins', this.fighter.wins);
        }
    }
};


function initialize (data) {
    const fighters = data.fighters.map(function (fighter) {
        fighter.losses = localStorage.getItem(fighter.number + '.losses') !== null ? parseInt(localStorage.getItem(fighter.number + '.losses')) : 0;
        fighter.selected = localStorage.getItem(fighter.number + '.selected') === 'false' ? false : true;
        fighter.wins = localStorage.getItem(fighter.number + '.wins') !== null ? parseInt(localStorage.getItem(fighter.number + '.wins')) : 0;

        return fighter;
    });

    new Vue({
        components: {
            'fp-fighter': Fighter,
        },
        computed: {
            nextFighter: function () {
                const candidates = fighters.filter(fighter => fighter.selected && (fighter.wins || fighter.losses)),
                    totalFights = candidates.reduce((total, candidate) => total + candidate.wins + candidate.losses, 0);

                let nextFighter = null,
                    nextFighterScore = null;

                for (const candidate of candidates) {
                    const candidateTotal = candidate.wins + candidate.losses,
                        mean = candidate.wins / candidateTotal,
                        variancePremium = Math.sqrt(2 * Math.log(totalFights / candidateTotal)),
                        score = mean + variancePremium;

                    if (!nextFighter || score > nextFighterScore) {
                        nextFighter = candidate;
                        nextFighterScore = score;
                    }
                }

                return nextFighter;
            },
            sortedFighters: function () {
                let sortFunction;

                switch (this.sort) {
                    case 'name':
                        sortFunction = (a, b) => a.name.localeCompare(b.name);
                        break;
                    case 'ratio':
                        sortFunction = function (a, b) {
                            const aTotal = a.wins + a.losses,
                                bTotal = b.wins + b.losses;

                            if (!aTotal && !bTotal) return a.number.localeCompare(b.number);
                            else if (!aTotal) return 1;
                            else if (!bTotal) return -1;
                            else return a.wins / aTotal > b.wins / bTotal ? -1 : 1;
                        };

                        break;
                    case 'number':
                    default:
                        sortFunction = (a, b) => a.number.localeCompare(b.number);
                        break;
                }

                return this.fighters.slice().sort(sortFunction);
            }
        },
        data: function () {
            return {
                fighters,
                sort: localStorage.getItem('fighter-sort') || 'number'
            };
        },
        el: '#app',
        watch: {
            'sort': function (value) {
                localStorage.setItem('fighter-sort', this.sort);
            }
        }
    });
}

fetch('data.json').then(response => response.json()).then(initialize);