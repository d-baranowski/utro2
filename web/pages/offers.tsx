import React from 'react';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { OfferBrowser } from '../src/components/offer/OfferBrowser';
import Layout from '../src/components/Layout';

const OffersPage = () => {
  return (
    <Layout>
      <OfferBrowser showOrganizationName={true} />
    </Layout>
  );
};

export const getServerSideProps = async ({ locale }: GetServerSidePropsContext) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default OffersPage;