import React from 'react';
import { connect } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import {
    countryCodeToId,
    countryIdToName,
    number,
    textToColor
} from '../../Utils';

class BarComponent extends React.Component {
    render() {
        const { labels, data, displayStats, countryImages } = this.props;

        return (
            <Bar
                height={350}
                data={canvas => {
                    const ctx = canvas.getContext('2d');

                    const bgImages = [];

                    labels.forEach(label => {
                        let color = textToColor(label);

                        if (displayStats === 'countries') {
                            const code = String(label).toLowerCase();
                            if (countryImages[code]) {
                                color = ctx.createPattern(countryImages[code], 'repeat');
                            } else {
                                window.BattleEye.loadCountryImage(code);
                            }
                        }

                        bgImages.push(color);
                    });

                    return {
                        labels,
                        datasets: [{
                            fontColor: '#ffffff',
                            data: data,
                            borderColor: '#3a4470',
                            backgroundColor: bgImages
                        }]
                    };
                }}
                options={{
                    maintainAspectRatio: false,
                    legend: {
                        display: false
                    },
                    tooltips: {
                        callbacks: {
                            title: item => {
                                const id = countryCodeToId(item[0].xLabel);
                                if (!id) {
                                    return item[0].xLabel;
                                }

                                return countryIdToName(id);
                            },
                            label: item => number(item.yLabel, true)
                        }
                    },
                    animation: {
                        duration: 0
                    },
                    hover: {
                        animationDuration: 0
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                fontColor: '#ffffff'
                            }
                        }],
                        xAxes: [{
                            ticks: {
                                fontColor: '#ffffff'
                            }
                        }]
                    }
                }}
            />
        );
    }
}

function mapState(state) {
    return {
        countryImages: state.main.countryImages
    };
}

export default connect(mapState)(BarComponent);
