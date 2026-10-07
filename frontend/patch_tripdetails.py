import sys

with open('src/pages/TripDetails.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add package var
content = content.replace(
    'const flight = booking.flightBooking;\n const hotel = booking.hotelBooking;',
    'const flight = booking.flightBooking;\n const hotel = booking.hotelBooking;\n const pkg = booking.packageBooking;'
)

# Fix title
content = content.replace(
    "{flight ? 'SmartTrip Electronic Flight Ticket' : 'SmartTrip Hotel Booking Voucher'}",
    "{flight ? 'SmartTrip Electronic Flight Ticket' : hotel ? 'SmartTrip Hotel Booking Voucher' : 'SmartTrip Package Booking Voucher'}"
)

# Fix print title
content = content.replace(
    "{flight ? 'Print Ticket / Save PDF' : 'Print Voucher / Save PDF'}",
    "{flight ? 'Print Ticket / Save PDF' : 'Print Voucher / Save PDF'}"
)

# Add package card after hotel card
pkg_card = '''        {pkg && (
          <Card className="shadow-sm border-theme-border print:shadow-none print:border-gray-300">
            <CardHeader title="PACKAGE BOOKING VOUCHER" className="mb-4 pb-4 border-b border-theme-border print:border-gray-300" />
            <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-theme-border print:border-gray-300">
              {pkg.packageImageUrl ? (
                <img src={pkg.packageImageUrl} alt={pkg.packageName} className="w-full md:w-56 h-36 object-cover rounded-lg shadow-sm border border-slate-100 dark:border-slate-800" />
              ) : (
                <div className="w-full md:w-56 h-36 bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center rounded-lg border border-brand-100 dark:border-brand-800/50">
                  <MapPin className="h-10 w-10 text-brand-400" />
                </div>
              )}
              <div className="flex-1 w-full">
                <h3 className="text-2xl font-black text-primary mb-1">{pkg.packageName}</h3>
                <div className="flex items-center text-sm font-medium text-secondary mb-4">
                  <MapPin className="w-4 h-4 mr-1 shrink-0 text-slate-400" />
                  {pkg.destination || 'Destination unavailable'}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-surface dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 print:bg-transparent print:border-none print:p-0">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Travel Date</p>
                    <p className="font-bold text-primary text-sm">{pkg.travelDate ? new Date(pkg.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '--'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Duration</p>
                    <p className="font-bold text-primary text-sm">{pkg.durationDays} Days</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Travelers</p>
                    <p className="font-bold text-primary text-sm">{pkg.travelers} Traveler{pkg.travelers !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>
            {pkg.providerConfirmation && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 print:border-gray-200 bg-slate-50 dark:bg-slate-900/50 print:bg-transparent rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-emerald-600 mb-1">Package Provider Confirmation</p>
                  <p className="font-mono font-black text-emerald-700 text-lg tracking-widest">{pkg.providerConfirmation}</p>
                </div>
              </div>
            )}
          </Card>
        )}
'''
content = content.replace('        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 break-inside-avoid">', pkg_card + '\n        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 break-inside-avoid">')

content = content.replace(
    "{hotel ? 'Guest Details' : 'Passenger Details'}",
    "{hotel ? 'Guest Details' : pkg ? 'Traveler Details' : 'Passenger Details'}"
)
content = content.replace(
    "{hotel ? 'Room Amount' : 'Base Fare'}",
    "{hotel ? 'Room Amount' : pkg ? 'Package Amount' : 'Base Fare'}"
)

with open('src/pages/TripDetails.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("TripDetails.jsx updated successfully!")
