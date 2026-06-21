import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
    color: '#333',
  },
  header: {
    marginBottom: 40,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C5CFC',
    marginBottom: 4,
  },
  userContact: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  date: {
    marginTop: 20,
    marginBottom: 20,
  },
  body: {
    textAlign: 'justify',
  },
  paragraph: {
    marginBottom: 15,
  }
});

interface CoverLetterData {
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  content: string;
  date: string;
}

export const CoverLetterPDF = ({ data }: { data: CoverLetterData }) => {
  // Split content into paragraphs for better rendering
  const paragraphs = data.content.split('\n').filter(p => p.trim() !== '');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - User Info */}
        <View style={styles.header}>
          <Text style={styles.userName}>{data.full_name}</Text>
          <Text style={styles.userContact}>{data.email}</Text>
          {data.phone && <Text style={styles.userContact}>{data.phone}</Text>}
          {data.location && <Text style={styles.userContact}>{data.location}</Text>}
        </View>

        {/* Date */}
        <View style={styles.date}>
          <Text>{data.date}</Text>
        </View>

        {/* Letter Content */}
        <View style={styles.body}>
          {paragraphs.map((para, i) => (
            <Text key={i} style={styles.paragraph}>{para}</Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};
