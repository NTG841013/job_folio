import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a standard professional font if needed, 
// otherwise defaults to Helvetica which is standard for PDF

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#7C5CFC',
    paddingBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C5CFC',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 4,
  },
  contact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    fontSize: 9,
    color: '#666',
    gap: 10,
  },
  section: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7C5CFC',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summary: {
    marginBottom: 10,
  },
  experienceItem: {
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  itemDate: {
    color: '#666',
    fontSize: 9,
  },
  itemSub: {
    fontSize: 10,
    color: '#4a4a4a',
    marginBottom: 4,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 10,
  },
  bullet: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  skill: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 9,
  }
});

interface ResumeData {
  full_name: string;
  current_title: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  professional_summary: string;
  work_experience: Array<{
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate: string;
    current: boolean;
    responsibilities: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
  }>;
  skills: string[];
}

export const ResumeTemplate = ({ data }: { data: ResumeData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.full_name}</Text>
        <Text style={styles.title}>{data.current_title}</Text>
        <View style={styles.contact}>
          <Text>{data.email}</Text>
          {data.phone && <Text>• {data.phone}</Text>}
          {data.location && <Text>• {data.location}</Text>}
          {data.linkedin_url && <Text>• LinkedIn</Text>}
          {data.portfolio_url && <Text>• Portfolio</Text>}
        </View>
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.summary}>{data.professional_summary}</Text>
      </View>

      {/* Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Work Experience</Text>
        {data.work_experience.map((exp, i) => (
          <View key={i} style={styles.experienceItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{exp.position}</Text>
              <Text style={styles.itemDate}>{exp.startDate} — {exp.current ? 'Present' : exp.endDate}</Text>
            </View>
            <Text style={styles.itemSub}>{exp.company}</Text>
            {exp.responsibilities.map((resp, j) => (
              <View key={j} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{resp}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu, i) => (
            <View key={i} style={{ marginBottom: 5 }}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{edu.institution}</Text>
                <Text style={styles.itemDate}>{edu.year}</Text>
              </View>
              <Text>{edu.degree} in {edu.field}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {data.skills.map((skill, i) => (
            <Text key={i} style={styles.skill}>{skill}</Text>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);
