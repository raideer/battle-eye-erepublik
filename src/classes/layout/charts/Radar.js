import React from 'react';
import { Radar } from 'react-chartjs-2';

export default class RadarComponent extends React.Component {
    render() {
        const { labels, data, colors } = this.props;
        return (
            <Radar
                height={350}
                data={{
                    labels: labels,
                    datasets: [
                        {
                            backgroundColor: 'rgba(56, 94, 221, 0.5)',
                            borderColor: '#7d91f2',
                            borderWidth: 1,
                            pointBackgroundColor: colors,
                            pointBorderColor: '#2d3456',
                            pointHoverBackgroundColor: '#2d3456',
                            data: data
                        }
                    ]
                }}
                options={{
                    maintainAspectRatio: false,
                    scale: {
                        pointLabels: {
                            fontColor: '#ffffff'
                        },
                        ticks: {
                            backdropColor: 'rgba(255, 255, 255, 0)',
                            fontColor: '#2d3456'
                        }
                    },
                    legend: {
                        display: false
                    }
                }}
            />
        );
    }
}
