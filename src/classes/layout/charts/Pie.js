import React from 'react';
import { connect } from 'react-redux';
import { Pie } from 'react-chartjs-2';
import { textToColor } from '../../Utils';

class PieComponent extends React.Component {
    render() {
        const { labels, data, displayStats, countryImages } = this.props;
        return (
            <Pie
                height={400}
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
                        position: 'bottom',
                        labels: {
                            fontColor: '#dfdfdf',
                            boxWidth: 10,
                            fontSize: 10
                        }
                    },
                    animation: {
                        duration: 0
                    },
                    hover: {
                        animationDuration: 0
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

export default connect(mapState)(PieComponent);
