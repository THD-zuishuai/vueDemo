export function validateContent(data) {
  const errors = []
  if (!data || typeof data !== 'object') return ['内容必须是 JSON 对象']
  for (const field of ['site', 'home', 'navigation', 'categories', 'games', 'guides']) {
    if (!(field in data)) errors.push(`缺少必要字段：${field}`)
  }
  if (data.site !== undefined && (!data.site || typeof data.site !== 'object' || Array.isArray(data.site))) errors.push('site 必须是对象')
  if (data.home !== undefined && (!data.home || typeof data.home !== 'object' || Array.isArray(data.home))) errors.push('home 必须是对象')
  if (data.navigation !== undefined && !Array.isArray(data.navigation)) errors.push('navigation 必须是数组')
  const ids = new Set(), gameIds = new Set((Array.isArray(data.games) ? data.games : []).map(x => x?.id).filter(Boolean)), categoryIds = new Set((Array.isArray(data.categories) ? data.categories : []).map(x => x?.id).filter(Boolean)), slugs = new Set(), linkIds = new Set()
  for (const [kind, rows] of [['分类', data.categories], ['游戏', data.games], ['攻略', data.guides]]) {
    if (!Array.isArray(rows)) { errors.push(`${kind}必须是数组`); continue }
    for (const row of rows) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) { errors.push(`${kind}中包含无效条目，必须是对象`); continue }
      if (!row.id) errors.push(`${kind}缺少 id`)
      else if (ids.has(row.id)) errors.push(`ID 重复：${row.id}`)
      ids.add(row.id)
      if (kind === '游戏') {
        if (!row.title || !row.slug) errors.push(`游戏 ${row.id} 缺少名称或网址标识`)
        if (row.slug && slugs.has(row.slug)) errors.push(`游戏网址标识重复：${row.slug}`)
        if (row.slug) slugs.add(row.slug)
        if (!Array.isArray(row.categoryIds)) errors.push(`游戏「${row.title}」的 categoryIds 必须是数组`)
        for (const id of row.categoryIds || []) if (!categoryIds.has(id)) errors.push(`游戏「${row.title}」引用了不存在的分类 ${id}`)
        if (!Array.isArray(row.relatedGameIds)) errors.push(`游戏「${row.title}」的相关推荐必须是数组`)
        for (const id of row.relatedGameIds || []) if (!gameIds.has(id)) errors.push(`游戏「${row.title}」关联了不存在的游戏 ${id}`)
        if (!['authorized_hosted','official_link','info_only'].includes(row.downloadMode)) errors.push(`游戏「${row.title}」下载模式无效`)
        if (!['permission_confirmed','official_only','pending_review'].includes(row.licenseStatus)) errors.push(`游戏「${row.title}」授权状态无效`)
        if (row.licenseUrl && !isHttpUrl(row.licenseUrl)) errors.push(`游戏「${row.title}」的授权证明链接格式无效`)
        if (row.sourceUrl && !isHttpUrl(row.sourceUrl)) errors.push(`游戏「${row.title}」的官方获取链接格式无效`)
        if (row.licenseStatus === 'official_only' && row.downloadMode === 'official_link' && !isHttpUrl(row.sourceUrl || '')) errors.push(`游戏「${row.title}」选择官方获取模式时需要填写有效的官方链接`)
        if (row.licenseUrl && !isHttpUrl(row.licenseUrl)) errors.push(`游戏「${row.title}」的授权证明链接格式无效`)
        if (row.sourceUrl && !isHttpUrl(row.sourceUrl)) errors.push(`游戏「${row.title}」的官方获取链接格式无效`)
        if (row.licenseStatus === 'official_only' && row.downloadMode === 'official_link' && !isHttpUrl(row.sourceUrl || '')) errors.push(`游戏「${row.title}」选择官方获取模式时需要填写有效的官方链接`)
        if (!Array.isArray(row.downloadLinks)) errors.push(`游戏「${row.title}」的 downloadLinks 必须是数组`)
        for (const link of row.downloadLinks || []) {
          if (!link || typeof link !== 'object' || Array.isArray(link)) { errors.push(`游戏「${row.title}」包含无效的下载渠道数据`); continue }
          if (!link.id || !link.provider || !link.label) errors.push(`游戏「${row.title}」的下载入口缺少 ID、网盘名称或按钮名称`)
          if (link.id && linkIds.has(link.id)) errors.push(`下载渠道 ID 重复：${link.id}`)
          if (link.id) linkIds.add(link.id)
          if (link.url && !isHttpUrl(link.url)) errors.push(`游戏「${row.title}」的下载入口 URL 格式无效`)
          if (link.enabled && !isHttpUrl(link.url || '')) errors.push(`游戏「${row.title}」启用的下载入口需要有效链接`)
          if (link.enabled && (row.demoOnly || row.published !== true || row.licenseStatus !== 'permission_confirmed')) errors.push(`游戏「${row.title}」只有正式发布、非演示且已核实授权时才能启用本站网盘入口`)
        }
        if (row.demoOnly !== undefined && typeof row.demoOnly !== 'boolean') errors.push(`游戏「${row.title}」的 demoOnly 必须是布尔值`)
        if (row.published !== undefined && typeof row.published !== 'boolean') errors.push(`游戏「${row.title}」的 published 必须是布尔值`)
      }
      if (kind === '攻略') for (const id of row.relatedGameIds || []) if (!gameIds.has(id)) errors.push(`攻略「${row.title}」关联了不存在的游戏 ${id}`)
    }
  }
  return errors
}

function isHttpUrl(value) {
  try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false }
}
