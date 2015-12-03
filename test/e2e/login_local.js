describe('Login sequence', function() {

    it('should store the jwt for further use', function () {
        browser.get('http://localhost:9000/?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyNjM4MDlkYjI1YjY0MGE0YzBkZTBkYmIyY2Y1ZjEyMyIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6OTAwMCIsImV4cCI6MTQ0OTE0Mjg1NiwianRpIjoiOG1ZMWwzLTFZbXNpcTQ1S3I3dUQxZyIsImlhdCI6MTQ0OTE0MjI1NiwibmJmIjoxNDQ5MTQyMTM2LCJzdWIiOiJmMDdkY2QyZi1hNGI5LTQ0ZWItOWI4My1mZmRiYTc5MjJjY2QiLCJuYW1lIjoibWFhcnRlbnMiLCJlbWFpbCI6bnVsbCwic3VybmFtZSI6Im1hYXJ0ZW5zIiwiZ2l2ZW5uYW1lIjpudWxsfQ.hVnEsZAzvAxjgk2lxGP2IpUPZsT90WmG_907qv6rcps');
    });
});