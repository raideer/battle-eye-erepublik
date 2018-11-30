import React from 'react';
import { Pie } from 'react-chartjs-2';

export default class PieComponent extends React.Component {
    render() {
        const { labels, data, colors } = this.props;
        return (
            <Pie
                height={500}
                data={{
                    labels: labels,
                    datasets: [{
                        fontColor: '#dfdfdf',
                        data: data,
                        borderColor: '#3a4470',
                        backgroundColor: colors
                    }]
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
