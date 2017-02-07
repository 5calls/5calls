package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

const (
	addrFailedToParse   = "400 Failed to parse address"
	addrNoInfo          = "404 No information for this address"
	localPlaceholder    = "LOCAL REP"
	senatePlaceholder   = "US SENATE"
	housePlaceholder    = "US HOUSE"
	governorPlaceholder = "GOVERNOR"
)

type handler struct {
	repFinder   RepFinder
	issueLister IssueLister
}

func (h *handler) GetIssues(w http.ResponseWriter, r *http.Request) {
	var localReps *LocalReps
	var normalizedAddress *Address
	var err error

	var civicLocationParam string
	zip := mux.Vars(r)["zip"]
	address := r.URL.Query().Get("address") // could be geolocation too

	if len(zip) != 0 && len(zip) == 5 {
		civicLocationParam = zip
	}
	if len(address) != 0 {
		civicLocationParam = address
	}

	issueResponse := IssueResponse{}
	if len(civicLocationParam) != 0 {
		log.Println("getting local reps for", civicLocationParam)

		localReps, normalizedAddress, err = h.repFinder.GetReps(civicLocationParam)
		if err != nil {
			log.Println("Unable to find local reps for", zip, err)
			invalidAddress := err.Error() == addrFailedToParse || err.Error() == addrNoInfo
			if invalidAddress {
				issueResponse.InvalidAddress = true
			}
		}
	} else {
		log.Println("no address or zip")
	}

	if localReps != nil && localReps.HouseRep == nil {
		issueResponse.SplitDistrict = true
	}

	if normalizedAddress != nil {
		issueResponse.NormalizedLocation = normalizedAddress.City
	}

	// add local reps where necessary
	all, err := h.issueLister.AllIssues()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	for _, issue := range all {
		newContacts := []Contact{}
		for _, contact := range issue.Contacts {
			if contact.Name == localPlaceholder {
				if localReps != nil {
					if localReps.HouseRep != nil {
						c := *localReps.HouseRep
						c.Reason = "This is your local representative in the house"
						newContacts = append(newContacts, c)
					}
					for _, s := range localReps.Senators {
						c := *s
						c.Reason = "This is one of your two senators"
						newContacts = append(newContacts, c)
					}
				}
			} else if contact.Name == senatePlaceholder {
				if localReps != nil {
					for _, s := range localReps.Senators {
						c := *s
						c.Reason = "This is one of your two senators"
						newContacts = append(newContacts, c)
					}
				}
			} else if contact.Name == housePlaceholder {
				if localReps != nil {
					if localReps.HouseRep != nil {
						c := *localReps.HouseRep
						c.Reason = "This is your local representative in the house"
						newContacts = append(newContacts, c)
					}
				}
			} else if contact.Name == governorPlaceholder {
				if localReps != nil {
					if localReps.Governor != nil {
						c := *localReps.Governor
						c.Reason = "This is your state governor"
						newContacts = append(newContacts, c)
					}
				}
			} else if contact.Phone == "" {
				// filter anyone without a phone
			} else {
				newContacts = append(newContacts, contact)
			}
		}
		issue.Contacts = newContacts
		issueResponse.Issues = append(issueResponse.Issues, issue)
	}
	writeJSON(w, issueResponse)
}
