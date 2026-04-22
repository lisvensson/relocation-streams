export function buildChartConfig(formData: FormData) {
  return {
    type: formData.get('type'),
    title: formData.get('chartTitle'),
    description: formData.get('chartDescription'),
    measure: formData.get('measure'),
    category: formData.get('category'),
    excludeSelectedArea: formData.get('excludeSelectedArea') === 'on',
    maxNumberOfCategories: Number(formData.get('maxNumberOfCategories')),
    combineRemainingCategories:
      formData.get('combineRemainingCategories') === 'on',
    chartType: formData.get('chartType'),
    measureCalculation: formData.get('measureCalculation'),
    uiSettings: {
      containerSize: formData.get('containerSize'),
      legendPlacement: formData.get('legendPlacement'),
      tablePlacement: formData.get('tablePlacement'),
    },
  }
}
