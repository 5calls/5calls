package main

type IssueResponse struct {
	SplitDistrict      bool    `json:"splitDistrict"`
	InvalidAddress     bool    `json:"invalidAddress"`
	NormalizedLocation string  `json:"normalizedLocation"`
	Issues             []Issue `json:"issues"`
}

// Issue is a thing to care about and call on
type Issue struct {
	ID       string    `json:"id"`
	Name     string    `json:"name"`
	Reason   string    `json:"reason"`
	Script   string    `json:"script"`
	Contacts []Contact `json:"contacts"`
}

func (i *Issue) String() string {
	return asJson(i)
}

// Contact is a single point of contact related to an issue
type Contact struct {
	ID           string        `json:"id"`
	Name         string        `json:"name"`
	Phone        string        `json:"phone"` // format: "555-888-1234"
	PhotoURL     string        `json:"photoURL"`
	Party        string        `json:"party"`
	State        string        `json:"state"`
	Reason       string        `json:"reason"`
	Area         string        `json:"area"`
	FieldOffices []FieldOffice `json:"field_offices"`
}

func (c *Contact) String() string {
	return asJson(c)
}

// LocalReps are the contacts that constitute local representatives
// for a supplied address.
type LocalReps struct {
	HouseRep *Contact   // house representative
	Senators []*Contact // senators
	Governor *Contact   // governor
}

// Address is a US address. It has the same structure as the normalized
// address returned by the civic API.
type Address struct {
	Line1 string
	City  string
	State string
	Zip   string
}
