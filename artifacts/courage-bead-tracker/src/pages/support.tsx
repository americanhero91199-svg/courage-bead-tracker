export default function Support() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <div className="font-display font-bold text-3xl text-primary mb-1">
            Courage Bead Tracker
          </div>
          <p className="text-muted-foreground text-sm">Support &amp; Privacy Policy</p>
        </div>

        {/* About */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">About the App</h2>
          <p className="text-muted-foreground leading-relaxed">
            Courage Bead Tracker is a personal tool for families to record and celebrate the courage beads
            earned by a child during medical treatment. Log each bead, add journal notes, and view a
            beautiful timeline of bravery — all privately on your own device.
          </p>
        </section>

        {/* Support */}
        <section className="mb-10" id="support">
          <h2 className="text-xl font-semibold mb-3">Support</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            If you have questions, feedback, or need help with the app, please reach out by email.
            We'll do our best to respond promptly.
          </p>
          <a
            href="mailto:Americanhero91199@yahoo.com"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            Americanhero91199@yahoo.com
          </a>
        </section>

        {/* Privacy Policy */}
        <section className="mb-10" id="privacy">
          <h2 className="text-xl font-semibold mb-3">Privacy Policy</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            <em>Last updated: July 1, 2026</em>
          </p>

          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <div>
              <h3 className="text-foreground font-medium mb-1">Data Storage</h3>
              <p>
                Courage Bead Tracker stores all timeline, bead, and journal information locally on your
                device. No data is transmitted to any external server or third party. Your records remain
                entirely private and under your control.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-medium mb-1">Data We Do Not Collect</h3>
              <p>
                We do not collect, store, or share any personal information, usage analytics, location
                data, or health information. There are no accounts, no sign-in, and no cloud sync.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-medium mb-1">Children's Privacy</h3>
              <p>
                The app does not collect any information from children or from anyone. All data entered
                stays on the device and is never transmitted anywhere.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-medium mb-1">Third-Party Services</h3>
              <p>
                This app does not integrate with any third-party analytics, advertising, or data services.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-medium mb-1">Data Deletion</h3>
              <p>
                You can delete all app data at any time by using the "Clear all data" option in the app's
                Settings, or by uninstalling the app from your device.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-medium mb-1">Contact</h3>
              <p>
                For privacy-related questions, contact us at{" "}
                <a href="mailto:Americanhero91199@yahoo.com" className="text-primary hover:underline">
                  Americanhero91199@yahoo.com
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Copyright */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Copyright</h2>
          <p className="text-muted-foreground leading-relaxed">
            &copy; {new Date().getFullYear()} Courage Bead Tracker. All rights reserved.
          </p>
        </section>

        {/* Disclaimer */}
        <section className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Courage Bead Tracker is an independent app and is not affiliated with or endorsed by Beads of Courage&reg;.
            Beads of Courage is a registered trademark of Beads of Courage, Inc.
          </p>
        </section>

      </div>
    </div>
  );
}
