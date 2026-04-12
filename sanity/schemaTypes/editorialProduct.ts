import { defineArrayMember, defineField, defineType } from 'sanity'

const CATEGORIES = [
  { title: 'Sport', value: 'sport' },
  { title: 'Tuner', value: 'tuner' },
  { title: 'Off-Road', value: 'offroad' },
  { title: 'Crossover', value: 'crossover' },
  { title: 'Interior', value: 'interior' },
  { title: 'Exterior', value: 'exterior' },
  { title: 'Performance', value: 'performance' },
  { title: 'Audio', value: 'audio' },
]

export const editorialProduct = defineType({
  name: 'editorialProduct',
  title: 'Editorial Product',
  type: 'document',
  fields: [
    defineField({
      name: 'shopifyHandle',
      title: 'Shopify Product Handle',
      type: 'string',
      description: 'Must match exactly the handle in your Shopify store',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'editorialTitle',
      title: 'Editorial Title',
      type: 'string',
      description: 'Optional override — leave blank to use the Shopify product title',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Shown in product grid cards',
    }),
    defineField({
      name: 'longDescription',
      title: 'Long Description',
      type: 'array',
      description: 'Rich text shown on the product detail page',
      of: [
        defineArrayMember({ type: 'block' }),
        defineArrayMember({ type: 'image', options: { hotspot: true } }),
      ],
    }),
    defineField({
      name: 'specs',
      title: 'Specifications',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Label', validation: (Rule) => Rule.required() }),
            defineField({ name: 'value', type: 'string', title: 'Value', validation: (Rule) => Rule.required() }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'value' },
          },
        }),
      ],
    }),
    defineField({
      name: 'editorialImages',
      title: 'Editorial Images',
      type: 'array',
      description: 'Additional images beyond what Shopify provides',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'string',
          options: { list: CATEGORIES },
        }),
      ],
      options: { layout: 'tags' },
    }),
  ],
  preview: {
    select: {
      title: 'editorialTitle',
      subtitle: 'shopifyHandle',
      media: 'editorialImages.0',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title ?? subtitle,
        subtitle: subtitle,
        media,
      }
    },
  },
})
