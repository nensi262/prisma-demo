import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import FlowHeading from "@/components/flows/sell/typography/FlowHeading";
import FlowSubHeading from "@/components/flows/sell/typography/FlowSubHeading";
import { useUser } from "@/providers/UserProvider";
import { mutationFetcher } from "@/utils/fetcher";
import { CheckCircle2 } from "lucide-react";
import useSWRMutation from "swr/mutation";

export default function Describe() {
  const { listing } = useSellerFlow();
  const { bearer } = useUser();

  const acceptTerms = useSWRMutation(
    {
      url: `/listings/seller/${listing.id}/terms`,
      bearer,
    },
    mutationFetcher,
  );

  return (
    <>
      <FlowHeading>The boring legal bits</FlowHeading>
      <FlowSubHeading>
        By continuing, and listing your property with us, you abide to the
        following terms:
      </FlowSubHeading>

      <div className="max-h-[500px] border-2 bg-gray-50 p-4 rounded-md overflow-scroll mt-10">
        <h1 className="text-3xl font-semibold mb-4">
          Moove - Terms and Conditions
        </h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>
            Welcome to Moove, the peer-to-peer property selling marketplace. By
            accessing or using our platform, you agree to comply with and be
            bound by these Terms and Conditions. Please read these terms
            carefully before using Moove. If you do not agree with these terms,
            please do not use our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">2. Definitions</h2>
          <ul>
            <li>
              <strong>&quot;Moove&quot;</strong> refers to the peer-to-peer
              property selling marketplace.
            </li>
            <li>
              <strong>&quot;User&quot;</strong> refers to any individual or
              entity using Moove&apos;s services.
            </li>
            <li>
              <strong>&quot;Listing&quot;</strong> refers to a property
              advertisement or posting created by a user for sale or rent.
            </li>
            <li>
              <strong>&quot;Buyer&quot;</strong> refers to a user interested in
              purchasing a property.
            </li>
            <li>
              <strong>&quot;Seller&quot;</strong> refers to a user interested in
              selling a property.
            </li>
            <li>
              <strong>&quot;Transaction&quot;</strong> refers to the process of
              buying or selling a property through Moove.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">3. User Registration</h2>
          <p>
            3.1. To use Moove&apos;s services, users may be required to create
            an account. Users agree to provide accurate and up-to-date
            information during the registration process.
          </p>
          <p>
            3.2. Users are responsible for maintaining the confidentiality of
            their account credentials and for all activities that occur under
            their account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">4. Property Listings</h2>
          <p>
            4.1. Users may create property listings on Moove. Listings must
            accurately represent the property, and users are responsible for the
            content and accuracy of their listings.
          </p>
          <p>
            4.2. Moove reserves the right to remove or modify any listing that
            violates our guidelines or applicable laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">5. Transactions</h2>
          <p>
            5.1. Moove facilitates property transactions between buyers and
            sellers. Users acknowledge that Moove is not a party to these
            transactions and is not responsible for the quality, legality, or
            accuracy of the properties listed.
          </p>
          <p>
            5.2. Users are solely responsible for negotiating and completing
            property transactions. Moove is not responsible for any disputes or
            issues that may arise during a transaction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">6. Fees and Payments</h2>
          <p>
            6.1. Moove may charge fees for certain services, such as premium
            listings or advertising options. Users will be notified of any
            applicable fees before using these services.
          </p>
          <p>
            6.2. Payments must be made in accordance with Moove&apos;s payment
            policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">7. Privacy and Data</h2>
          <p>
            7.1. Moove&apos;s Privacy Policy governs the collection, use, and
            sharing of user data. By using our services, users agree to our
            Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            8. Prohibited Activities
          </h2>
          <p>
            Users agree not to engage in any activities on Moove that are
            illegal, violate our policies, or infringe upon the rights of
            others.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">9. Termination</h2>
          <p>
            Moove reserves the right to suspend or terminate user accounts for
            violations of these Terms and Conditions or for any other reason,
            with or without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            10. Disclaimer of Warranties
          </h2>
          <p>
            Users acknowledge that Moove provides its services
            &quot;as-is,&quot; without warranties of any kind, including
            accuracy, fitness for a particular purpose, or availability.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            11. Limitation of Liability
          </h2>
          <p>
            Moove is not liable for any damages or losses arising from the use
            of our platform, including but not limited to direct, indirect,
            incidental, or consequential damages.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">12. Changes to Terms</h2>
          <p>
            Moove may modify these Terms and Conditions at any time. Users will
            be notified of changes, and continued use of our platform
            constitutes acceptance of the modified terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">13. Governing Law</h2>
          <p>
            These Terms and Conditions are governed by and construed in
            accordance with the laws of [Jurisdiction]. Any disputes arising
            under these terms will be subject to the exclusive jurisdiction of
            the courts in [Jurisdiction].
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">
            14. Contact Information
          </h2>
          <p>
            If you have any questions or concerns about these Terms and
            Conditions, please contact us at [Contact Email].
          </p>
        </section>
      </div>
      {listing.termsAcceptedAt && (
        <div className="mt-4 mb-0 flex items-center gap-2">
          <CheckCircle2 className="text-green-500" />
          <p className="text-sm font-semibold">
            You accepted terms on the{" "}
            {new Intl.DateTimeFormat("en-GB", {
              dateStyle: "long",
              timeStyle: "short",
            }).format(new Date(listing.termsAcceptedAt))}
            .
          </p>
        </div>
      )}
      <NavigationButtons
        onNext={async (next) => {
          if (listing.termsAcceptedAt) return next();
          await acceptTerms.trigger();
          next();
        }}
        loading={acceptTerms.isMutating}
      />
    </>
  );
}
