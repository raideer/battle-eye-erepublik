import React from 'react';
import { Bar } from 'react-chartjs-2';

export default class BarComponent extends React.Component {
    render() {
        const { labels, data, colors } = this.props;
        return (
            <Bar
                height={350}
                data={{
                    labels: labels,
                    datasets: [{
                        fontColor: '#ffffff',
                        data: data,
                        borderColor: '#3a4470',
                        backgroundColor: colors
                    }]
                }}
                options={{
                    maintainAspectRatio: false,
                    legend: {
                        display: false
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
