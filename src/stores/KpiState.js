import {
    observable,
    action
  } from "mobx";

import * as KpiAPI from '../lib/api/kpi';
var echarts = require('echarts');
var moment = require('moment');

export default class AppState {
    @observable searchKPI;
    @observable loading;

    constructor() {
        var from = moment(moment().subtract(14, 'days').calendar()).format('YYYYMMDD');  // d-14
        var to = moment().subtract(1, 'days').format('YYYYMMDD');// d-1

        this.searchKPI = {
            from: from,
            to: to,
            country: 'all',
            kind: 'graph',
            radio: 'rev',
        }

        this.loading = 'off';
    }


    @action setLoading(value) {
        this.loading = value;
    }

    async fetchNewDate() { 
        var myChart = echarts.init(document.getElementById('chart'));

        //this.searchKPI.from = '2018-04-01' // for test
        //this.searchKPI.to = '2018-06-30' // for test
        //this.searchKPI.country = 'all' // defult all
        //this.searchKPI.kind = 'graph' // for test

        //var legend = ['china', 'japan', 'korea', 'namerica', 'taiwan', 'total']
        //var color = ['#2f4554', '#5af70c', '#f7270c', '#0ef9e2', '#ca8622', '#108ce5', '#6e7074']
        var legend = ['china', 'japan', 'korea', 'namerica', 'taiwan', 'total']
        var color = ['#2f4554', '#0ef9e2', '#5af70c', '#f7270c', '#108ce5', '#ca8622', '#6e7074']

         // series
        var lseries = new Object();
        lseries = {};

        var ldata = new Array();

        var text = ''
        switch (this.searchKPI.radio) {
            case 'rev':
                text = 'Revenue - ₩';
                break;
            case 'avg':
                text = 'Avg concurrent users (평균동접)';
                break;
            case 'mcu':
                text = 'Max concurrent users (최대동접)';
                break;
            case 'nru':
                text = 'New registered users (신규등록유저)';
                break;
        }

        // specify chart configuration item and data
        var option = {
            title: {
                left: 'left',
                text: text
            },
            tooltip : {
                trigger: 'axis',
                /*
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
                */
            },
            legend: {
                data:legend
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis : [
                {
                    type : 'category',
                    boundaryGap : true,
                    data : []
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : []
        };

        try {
            const response = await KpiAPI.getKPI(this.searchKPI);

            //set series
            // i = column, j = row
            for (var i=0; i<Object.keys(response.data.data[0]).length; i++) {
                for (var j=0; j<response.data.data.length; j++) {
                    // legend
                    if (i == 0) {
                        option.xAxis[0].data.push(moment(response.data.data[j].cdate).format('ll'));
                        //options.xaxis.categories.push(response.data.data[j].cdate);
                    }else{
                        //series
                        // i==1 china
                        // i==2 japan
                        // i==3 korea
                        // i==4 namerica
                        // i==5 taiwan
                        // i==6 total
                        lseries.name = Object.keys(response.data.data[j])[i];
                        lseries.type = 'line';
                        lseries.label = {normal: {show: false,}};
                        lseries.color = color[i];
                        //lseries.stack = '总量',
                        //lseries.areaStyle= {normal: {}}
                        //console.log(response.data.data[j]);

                        switch (i) {
                            case 1: // korea
                                ldata.push(response.data.data[j].china);
                                break;
                            case 2: // china
                                ldata.push(response.data.data[j].japan);
                                break;
                            case 3: // japan
                                ldata.push(response.data.data[j].korea);
                                break;
                            case 4: // taiwan
                                ldata.push(response.data.data[j].namerica);
                                break;
                            case 5: // namerica
                                ldata.push(response.data.data[j].taiwan);
                                break;
                            case 6: // total
                                ldata.push(response.data.data[j].total);
                                break;
                        }

                    }
                
                }

                //console.log("ldata: ", ldata);
                // save ldata to series.data
                lseries.data = ldata;
                //console.log("series.name: ",lseries.name,"series.data: ", lseries.data);
                //console.log("lseries: ",lseries);

                //seiresArray.push(lseries);
                if (i > 0) {
                    option.series.push(lseries);
                }
                
                //option.series.push(series)
                //console.log("series: ",seiresArray);

                lseries = {};
                ldata = [];
            }

            //console.log("series: ",seiresArray);
            //console.log("legend: ", option.xAxis[0].data)
            //console.log("option.series: ", option.series);
            //console.log("option: ", option);

            myChart.setOption(option);

            /* table */
            var table = new Tabulator("#tabulator-2", {
                //height: 511, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                autoResize:true, 
                resizableRows:true,
                layout: "fitColumns", //fit columns to width of table (optional, fitDataFill, fitColumns)
                //responsiveLayout: true,
                placeholder: "No Data Available", //display message to user on empty table
                columns: [ //Define Table Columns
                    {
                        title: "Date",
                        //formatter: "rownum",
                        field: "cdate",
                        align: "center",
                        //width: 70,
                        formatter: function(cell, formatterParams) {
                            return moment(cell.getValue()).format('ll')
                        }
                    },
                    {
                        title: "Korea",
                        //formatter: "rownum",
                        field: "korea",
                        align: "center",
                        formatter: function(cell, formatterParams) {
                            //return '₩ '+numeral(cell.getValue()).format('0,0');
                            return numeral(cell.getValue()).format('0,0');
                        }
                        //width: 200,
                        //headerFilter:true,
                    },
                    {
                        title: "China",
                        //formatter: "rownum",
                        field: "china",
                        align: "center",
                        formatter: function(cell, formatterParams) {
                            //return '₩ '+numeral(cell.getValue()).format('0,0');
                            return numeral(cell.getValue()).format('0,0');
                        }
                        //width: 200,
                        //headerFilter:true,
                    },
                    {
                        title: "Japan",
                        //formatter: "rownum",
                        field: "japan",
                        align: "center",
                        formatter: function(cell, formatterParams) {
                            //return '₩ '+numeral(cell.getValue()).format('0,0');
                            return numeral(cell.getValue()).format('0,0');
                        }
                        //width: 200,
                        //headerFilter:true,
                    },
                    {
                        title: "Taiwan",
                        //formatter: "rownum",
                        field: "taiwan",
                        align: "center",
                        formatter: function(cell, formatterParams) {
                            //return '₩ '+numeral(cell.getValue()).format('0,0');
                            return numeral(cell.getValue()).format('0,0');
                        }
                        //width: 200,
                        //headerFilter:true,
                    },
                    
                    {
                        title: "North America",
                        //formatter: "rownum",
                        field: "namerica",
                        align: "center",
                        formatter: function(cell, formatterParams) {
                            //return '₩ '+numeral(cell.getValue()).format('0,0');
                            return numeral(cell.getValue()).format('0,0');
                        }
                        //width: 200,
                        //headerFilter:true,
                    },
                    
                    {
                        title: "Total",
                        //formatter: "rownum",
                        field: "total",
                        align: "center",
                        formatter: function(cell, formatterParams) {
                            //return '₩ '+numeral(cell.getValue()).format('0,0');
                            return numeral(cell.getValue()).format('0,0');
                        }
                        //width: 200,
                        //headerFilter:true,
                    },

                    /*
                    {
                        title: "Seha",
                        //formatter: "rownum",
                        field: "seha",
                        align: "center",
                        //width: 200,
                        formatter: function(cell, formatterParams) {
                          if (cell.getValue() != ''){
                            return '<img src="'+cell.getValue()+'" height="200" width="200"/>';
                          }else{
                            return
                          }
                        }
                    },
                    */
                ],
               
            });
    
            //table.setData(BACKEND_API+'/v1/resource/list', {}, "GET");
            table.setData(response.data.data);

            this.setLoading('off');

        } catch (error) {
            this.setLoading('off');
            console.error(error);
        }

    }

    // for apexchart
    /*
    async fetchNewDate() { 
        var options = {
        chart: {
            width: "100%",
            height: 380,
            type: 'line'
        },
        legend: {
            position: 'top'
        },
        dataLabels: {
            enabled: false,
            formatter: function (val, opts) {
            return '₩ '+numeral(val).format('0,0');
            },
            style: {
            fontSize: '10px',
            }
        },
        grid: {
            position: 'front'
        },
        series: [],
        xaxis: {
            //type: "datetime",
            categories: [],
            labels: {
            formatter: function (value) {
                return moment(value).format('ll');
            }
            }
        },
        yaxis: {
            labels: {
            formatter: function (value) {
                return '₩ '+numeral(value).format('0,0');
            }
            },
        },
        }


        this.searchKPI.from = '2019-01-01' // for test
        this.searchKPI.to = '2019-03-13' // for test
        this.searchKPI.country = 'all' // for test
        this.searchKPI.kind = 'graph' // for test
        
        //this.option.series = [];

         // series
        var seiresArray = new Array();
        seiresArray = [];

        var lseries = new Object();
        lseries = {};

        var ldata = new Array();

        try {
        const response = await axios.post(BACKEND_API+'/v1/kpi/list', {...this.searchKPI});
        console.log(response.data.data, response.data.data.length);

        //set series
        // i = column, j = row
        for (var i=0; i<Object.keys(response.data.data[0]).length; i++) {
            for (var j=0; j<response.data.data.length; j++) {
            // legend
            if (i == 0) {
                //option.xAxis[0].data.push(response.data.data[j].cdate);
                options.xaxis.categories.push(response.data.data[j].cdate);
            }else{
                //series
                // i==1 china
                // i==2 japan
                // i==3 korea
                // i==4 na
                // i==5 taiwan
                // i==6 total
                lseries.name = Object.keys(response.data.data[j])[i];
                //lseries.type = 'line';
                //lseries.label = {normal: {show: true,}};
                //lseries.stack = '总量',
                //lseries.areaStyle= {normal: {}}

                switch (i) {
                case 1: // china
                    ldata.push(Number(response.data.data[j].china));
                    break;
                case 2: // japan
                    ldata.push(Number(response.data.data[j].japan));
                    break;
                case 3: // korea
                    ldata.push(Number(response.data.data[j].korea));
                    break;
                case 4: // na
                    ldata.push(Number(response.data.data[j].na));
                    break;
                case 5: // taiwan
                    ldata.push(Number(response.data.data[j].taiwan));
                    break;
                case 6: // total
                    ldata.push(Number(response.data.data[j].total));
                    break;
                }

                //console.log(j,i,keys,response.data.data[j].keys);
                //ldata.push((response.data.data[j])[i]);
            }
            
            }

            //console.log("ldata: ", ldata);

            // save ldata to series.data
            lseries.data = ldata;
            console.log("series.name: ",lseries.name,"series.data: ", lseries.data);

            //console.log("lseries: ",lseries);

            //seiresArray.push(lseries);
            if (i > 0) {
            options.series.push(lseries);
            }
            
            //option.series.push(series)
            //console.log("series: ",seiresArray);

            lseries = {};
            ldata = [];
        }

        console.log("series: ",seiresArray);
        console.log("legend: ", options.xaxis.categories)
        console.log("option.series: ", options.series);
        console.log("option: ", options);

        //this.setState({this.option,});

        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();

        } catch (error) {
        console.error(error);
        }
        
    };
    */


}