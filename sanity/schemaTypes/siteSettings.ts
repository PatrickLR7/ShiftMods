import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'siteDescription',
      title: 'Site Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroSection',
      title: 'Hero Section',
      type: 'reference',
      to: [{ type: 'heroSection' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredCollectionHandle',
      title: 'Featured Collection Handle',
      type: 'string',
      description: 'Shopify collection handle to display on the homepage (e.g. "featured-builds")',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'siteTitle' },
  },
})
