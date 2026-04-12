import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemaTypes'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

if (!projectId) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is not set')
if (!dataset) throw new Error('NEXT_PUBLIC_SANITY_DATASET is not set')

export default defineConfig({
  name: 'shift-mods',
  title: 'ShiftMods Studio',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            S.listItem()
              .title('Hero Sections')
              .schemaType('heroSection')
              .child(S.documentTypeList('heroSection').title('Hero Sections')),
            S.listItem()
              .title('Editorial Products')
              .schemaType('editorialProduct')
              .child(S.documentTypeList('editorialProduct').title('Editorial Products')),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
