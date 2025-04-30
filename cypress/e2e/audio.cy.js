describe('Audio Player', () => {

    it("plays audio", () => {
        cy.visit('/')

        cy.get('.song-item').first().click();
        cy.get('#play-btn').click();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(5000);
        cy.get('#play-pause-btn').click();
    })

});