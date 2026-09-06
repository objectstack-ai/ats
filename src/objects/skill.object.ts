import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * Shared skill vocabulary. Referenced by `ats_job.required_skills` and
 * `ats_candidate.skills`, so matching compares ids rather than free text.
 */
export const Skill = ObjectSchema.create({
  name: 'ats_skill',
  label: 'Skill',
  pluralLabel: 'Skills',
  icon: 'tag',
  description: 'A skill tag shared by job requirements and candidate profiles.',

  // A global vocabulary is useless if it is not globally readable. Write access
  // is withheld from every non-platform role by the permission sets instead.
  sharingModel: 'public_read',

  fields: {
    name: Field.text({
      label: 'Skill',
      required: true,
      searchable: true,
      maxLength: 120,
    }),
    category: Field.select({
      label: 'Category',
      defaultValue: 'domain',
      options: [
        { label: 'Technical',   value: 'technical',              color: '#3B82F6' },
        { label: 'Domain',      value: 'domain', default: true,  color: '#0B6E63' },
        { label: 'Tool',        value: 'tool',                   color: '#8B5CF6' },
        { label: 'Language',    value: 'language',               color: '#F59E0B' },
        { label: 'Soft Skill',  value: 'soft',                   color: '#94A3B8' },
      ],
    }),
    aliases: Field.text({
      label: 'Aliases',
      maxLength: 240,
      searchable: true,
      description: 'Comma-separated synonyms, so a search for one spelling finds the tag.',
    }),
    description: Field.textarea({
      label: 'Description',
    }),
  },

  enable: {
    apiEnabled: true,
    searchable: true,
  },
});
