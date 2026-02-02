import ChartRenderer from '~/components/charts/chartRenderer'
import type { ChartModel } from '~/shared/database/models/chartModels'

export default function TestChart() {
  const NetFlowChart: ChartModel = {
    title: 'Nettoflytt per år eskilstuna (volym)',
    type: 'column',
    measure: 'inflow',
    dimension: 'year',
    series: ['inflow', 'outflow', 'net'],
    data: [
      { year: '2021', inflow: 65, outflow: 48, net: 17 },
      { year: '2022', inflow: 84, outflow: 65, net: 19 },
      { year: '2023', inflow: 107, outflow: 55, net: 52 },
      { year: '2024', inflow: 87, outflow: 74, net: 13 },
      { year: '2025', inflow: 52, outflow: 80, net: -28 },
    ],
  }

  const temporalChart: ChartModel = {
    title: 'Utflytt per år från eskilstuna (volym)',
    type: 'column',
    measure: 'outflow',
    dimension: 'year',
    series: ['outflow'],
    data: [
      { year: '2021', outflow: 48 },
      { year: '2022', outflow: 65 },
      { year: '2023', outflow: 55 },
      { year: '2024', outflow: 74 },
      { year: '2025', outflow: 80 },
    ],
  }

  const categoryChartBar: ChartModel = {
    title: 'Inflytt per kategori till eskilstuna (volym)',
    type: 'bar',
    measure: 'inflow',
    dimension: 'industryCluster',
    series: ['inflow'],
    data: [
      { industryCluster: 'Bygg', inflow: 63 },
      { industryCluster: 'Infrastruktur', inflow: 51 },
      { industryCluster: 'Konsult/Kontorstjänster', inflow: 47 },
      { industryCluster: 'Tillverkning', inflow: 30 },
      { industryCluster: 'Sällanköpshandel', inflow: 26 },
      { industryCluster: 'Mat/Dryck/Logi', inflow: 25 },
      { industryCluster: 'Vård', inflow: 25 },
      { industryCluster: 'Logistik/Gods', inflow: 24 },
      { industryCluster: 'Fastighet', inflow: 20 },
      { industryCluster: 'HR', inflow: 19 },
      { industryCluster: 'Övrigt', inflow: 65 },
    ],
  }

  const categoryChartPie: ChartModel = {
    title: 'Inflytt per kategori till eskilstuna (volym)',
    type: 'pie',
    measure: 'inflow',
    dimension: 'industryCluster',
    series: ['inflow'],
    data: [
      { industryCluster: 'Bygg', inflow: 63 },
      { industryCluster: 'Infrastruktur', inflow: 51 },
      { industryCluster: 'Konsult/Kontorstjänster', inflow: 47 },
      { industryCluster: 'Tillverkning', inflow: 30 },
      { industryCluster: 'Sällanköpshandel', inflow: 26 },
      { industryCluster: 'Mat/Dryck/Logi', inflow: 25 },
      { industryCluster: 'Vård', inflow: 25 },
      { industryCluster: 'Logistik/Gods', inflow: 24 },
      { industryCluster: 'Fastighet', inflow: 20 },
      { industryCluster: 'HR', inflow: 19 },
      { industryCluster: 'Övrigt', inflow: 65 },
    ],
  }

  const temporalCategoryChart: ChartModel = {
    title: 'Utflytt per år och kategori från stockholm (volym)',
    type: 'line',
    measure: 'outflow',
    dimension: 'year',
    series: [
      'stockholm',
      'tyresö',
      'lidingö',
      'sollentuna',
      'solna',
      'haninge',
      'huddinge',
      'nacka',
      'danderyd',
      'upplands väsby',
    ],
    data: [
      {
        year: '2021',
        danderyd: 76,
        haninge: 116,
        huddinge: 142,
        lidingö: 360,
        nacka: 117,
        sollentuna: 255,
        solna: 296,
        stockholm: 1281,
        tyresö: 360,
        'upplands väsby': 85,
      },
      {
        year: '2022',
        danderyd: 109,
        haninge: 181,
        huddinge: 191,
        lidingö: 346,
        nacka: 152,
        sollentuna: 269,
        solna: 223,
        stockholm: 1203,
        tyresö: 341,
        'upplands väsby': 115,
      },
      {
        year: '2023',
        danderyd: 127,
        haninge: 157,
        huddinge: 126,
        lidingö: 383,
        nacka: 134,
        sollentuna: 275,
        solna: 210,
        stockholm: 1151,
        tyresö: 380,
        'upplands väsby': 136,
      },
      {
        year: '2024',
        danderyd: 122,
        haninge: 152,
        huddinge: 153,
        lidingö: 397,
        nacka: 148,
        sollentuna: 281,
        solna: 177,
        stockholm: 1199,
        tyresö: 399,
        'upplands väsby': 106,
      },
      {
        year: '2025',
        danderyd: 67,
        haninge: 110,
        huddinge: 89,
        lidingö: 191,
        nacka: 86,
        sollentuna: 151,
        solna: 148,
        stockholm: 739,
        tyresö: 217,
        'upplands väsby': 52,
      },
    ],
  }

  const chart: ChartModel = {
    title: 'Utflytt per år och kategori från stockholm (volym)',
    type: 'line',
    measure: 'outflow',
    dimension: 'year',
    series: ['stockholm', 'tyresö', 'lidingö', 'sollentuna', 'solna', 'Övrigt'],
    data: [
      {
        year: '2021',
        lidingö: 360,
        sollentuna: 255,
        solna: 296,
        stockholm: 1281,
        tyresö: 360,
        Övrigt: 1966,
      },
      {
        year: '2022',
        lidingö: 346,
        sollentuna: 269,
        solna: 223,
        stockholm: 1203,
        tyresö: 341,
        Övrigt: 2267,
      },
      {
        year: '2023',
        lidingö: 383,
        sollentuna: 275,
        solna: 210,
        stockholm: 1151,
        tyresö: 380,
        Övrigt: 2233,
      },
      {
        year: '2024',
        lidingö: 397,
        sollentuna: 281,
        solna: 177,
        stockholm: 1199,
        tyresö: 399,
        Övrigt: 1910,
      },
      {
        year: '2025',
        lidingö: 191,
        sollentuna: 151,
        solna: 148,
        stockholm: 739,
        tyresö: 217,
        Övrigt: 1119,
      },
    ],
  }

  return (
    <div className="p-10">
      <ChartRenderer {...NetFlowChart} />
      <ChartRenderer {...temporalChart} />
      <ChartRenderer {...categoryChartBar} />
      <ChartRenderer {...categoryChartPie} />
      <ChartRenderer {...temporalCategoryChart} />
      {/* <ChartRenderer {...chart} /> */}
    </div>
  )
}
